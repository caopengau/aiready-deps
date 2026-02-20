/**
 * DynamoDB Single-Table Design for AIReady Platform
 * 
 * Table: aiready-platform
 * 
 * PK Patterns:
 *   USER#<userId>           - User record
 *   REPO#<repoId>           - Repository record
 *   ANALYSIS#<repoId>       - Analysis records for a repo
 * 
 * SK Patterns:
 *   #METADATA               - Entity metadata
 *   #LIST                   - List entry (for GSI1)
 *   <timestamp>             - Analysis timestamp (sorted)
 * 
 * GSI1: List all repos for a user
 *   GSI1PK: USER#<userId>
 *   GSI1SK: REPO#<repoId>
 * 
 * GSI2: List all analyses for a repo (most recent first)
 *   GSI2PK: ANALYSIS#<repoId>
 *   GSI2SK: <timestamp>
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { convertEmptyValues: true, removeUndefinedValues: true },
  unmarshallOptions: { wrapNumbers: false },
});

const TABLE_NAME = process.env.DYNAMO_TABLE || 'aiready-platform';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  githubId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  userId: string;
  name: string;
  url: string;
  description?: string;
  defaultBranch: string;
  lastAnalysisAt?: string;
  aiScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  repoId: string;
  userId: string;
  timestamp: string;
  aiScore: number;
  breakdown: {
    semanticDuplicates: number;
    contextFragmentation: number;
    namingConsistency: number;
    documentationHealth: number;
  };
  rawKey: string; // S3 key for raw JSON
  summary: {
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  };
  createdAt: string;
}

// User operations
export async function createUser(user: User): Promise<User> {
  const now = new Date().toISOString();
  const item = {
    PK: `USER#${user.id}`,
    SK: '#METADATA',
    GSI1PK: 'USERS',
    GSI1SK: user.email,
    ...user,
    createdAt: user.createdAt || now,
    updatedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return user;
}

export async function getUser(userId: string): Promise<User | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `USER#${userId}`, SK: '#METADATA' },
  }));

  return result.Item ? result.Item as User : null;
}

export async function getUserByGithubId(githubId: string): Promise<User | null> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
    ExpressionAttributeValues: {
      ':pk': 'USERS',
      ':sk': `GITHUB#${githubId}`,
    },
  }));

  return result.Items?.[0] as User | null;
}

// Repository operations
export async function createRepository(repo: Repository): Promise<Repository> {
  const now = new Date().toISOString();
  const item = {
    PK: `REPO#${repo.id}`,
    SK: '#METADATA',
    GSI1PK: `USER#${repo.userId}`,
    GSI1SK: `REPO#${repo.id}`,
    ...repo,
    createdAt: repo.createdAt || now,
    updatedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return repo;
}

export async function getRepository(repoId: string): Promise<Repository | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REPO#${repoId}`, SK: '#METADATA' },
  }));

  return result.Item ? result.Item as Repository : null;
}

export async function listUserRepositories(userId: string): Promise<Repository[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':prefix': 'REPO#',
    },
    ScanIndexForward: false, // Most recent first
  }));

  return (result.Items || []) as Repository[];
}

export async function updateRepository(repoId: string, updates: Partial<Repository>): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'userId') continue; // Don't update keys
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  if (updateExpressions.length === 0) return;

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  await doc.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REPO#${repoId}`, SK: '#METADATA' },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
}

export async function deleteRepository(repoId: string): Promise<void> {
  await doc.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REPO#${repoId}`, SK: '#METADATA' },
  }));
}

// Analysis operations
export async function createAnalysis(analysis: Analysis): Promise<Analysis> {
  const now = new Date().toISOString();
  const item = {
    PK: `ANALYSIS#${analysis.repoId}`,
    SK: analysis.timestamp,
    GSI1PK: `USER#${analysis.userId}`,
    GSI1SK: `ANALYSIS#${analysis.timestamp}`,
    GSI2PK: `ANALYSIS#${analysis.repoId}`,
    GSI2SK: analysis.timestamp,
    ...analysis,
    createdAt: analysis.createdAt || now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  
  // Update repo's lastAnalysisAt and aiScore
  await updateRepository(analysis.repoId, {
    lastAnalysisAt: analysis.timestamp,
    aiScore: analysis.aiScore,
  });

  return analysis;
}

export async function getAnalysis(repoId: string, timestamp: string): Promise<Analysis | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `ANALYSIS#${repoId}`, SK: timestamp },
  }));

  return result.Item ? result.Item as Analysis : null;
}

export async function listRepositoryAnalyses(repoId: string, limit = 10): Promise<Analysis[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `ANALYSIS#${repoId}`,
    },
    Limit: limit,
    ScanIndexForward: false, // Most recent first
  }));

  return (result.Items || []) as Analysis[];
}

export async function getLatestAnalysis(repoId: string): Promise<Analysis | null> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `ANALYSIS#${repoId}`,
    },
    Limit: 1,
    ScanIndexForward: false, // Most recent first
  }));

  return result.Items?.[0] as Analysis | null;
}

export { doc, TABLE_NAME };
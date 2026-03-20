import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { doc, TABLE_NAME } from './client';
import { putItem, getItem, queryItems, deleteItem, PK, SK } from './helpers';
import type { Repository } from './types';

export async function createRepository(repo: Repository): Promise<Repository> {
  const now = new Date().toISOString();
  const item = {
    PK: PK.repo(repo.id),
    SK: SK.metadata,
    GSI1PK: repo.teamId ? PK.team(repo.teamId) : PK.user(repo.userId),
    GSI1SK: `REPO#${repo.id}`,
    ...repo,
    createdAt: repo.createdAt || now,
    updatedAt: now,
  };
  await putItem(item);
  return repo;
}

export async function getRepository(
  repoId: string
): Promise<Repository | null> {
  return getItem<Repository>({ PK: PK.repo(repoId), SK: SK.metadata });
}

export async function listUserRepositories(
  userId: string
): Promise<Repository[]> {
  return queryItems<Repository>({
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': PK.user(userId),
      ':prefix': 'REPO#',
    },
    ScanIndexForward: false,
  });
}

export async function listTeamRepositories(
  teamId: string
): Promise<Repository[]> {
  return queryItems<Repository>({
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': PK.team(teamId),
      ':prefix': 'REPO#',
    },
    ScanIndexForward: false,
  });
}

export async function deleteRepository(repoId: string): Promise<void> {
  await deleteItem({ PK: PK.repo(repoId), SK: SK.metadata });
}

export async function updateRepositoryScore(
  repoId: string,
  score: number,
  lastCommitHash?: string
): Promise<void> {
  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: PK.repo(repoId), SK: SK.metadata },
      UpdateExpression:
        'SET aiScore = :s, lastAnalysisAt = :t, updatedAt = :t, isScanning = :f, lastCommitHash = :h',
      ExpressionAttributeValues: {
        ':s': score,
        ':t': new Date().toISOString(),
        ':f': false,
        ':h': lastCommitHash || null,
      },
    })
  );
}

export async function setRepositoryScanning(repoId: string): Promise<void> {
  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: PK.repo(repoId), SK: SK.metadata },
      UpdateExpression: 'SET isScanning = :scanning, updatedAt = :t',
      ExpressionAttributeValues: {
        ':scanning': true,
        ':t': new Date().toISOString(),
      },
    })
  );
}

export async function updateRepositoryConfig(
  repoId: string,
  config: Record<string, unknown>
): Promise<void> {
  const setExpressions: string[] = [];
  const values: Record<string, unknown> = {};
  const names: Record<string, string> = {};

  let idx = 0;
  for (const [key, value] of Object.entries(config)) {
    const valKey = `:v${idx}`;
    const nameKey = `#n${idx}`;
    setExpressions.push(`${nameKey} = ${valKey}`);
    values[valKey] = value;
    names[nameKey] = key;
    idx++;
  }

  if (setExpressions.length === 0) return;

  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: PK.repo(repoId), SK: SK.metadata },
      UpdateExpression: `SET ${setExpressions.join(', ')}, updatedAt = :t`,
      ExpressionAttributeValues: { ...values, ':t': new Date().toISOString() },
      ExpressionAttributeNames: names,
    })
  );
}

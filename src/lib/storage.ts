/**
 * S3 Storage utilities for AIReady Platform
 * 
 * Bucket: aiready-platform-analysis
 * 
 * Key patterns:
 *   analyses/<userId>/<repoId>/<timestamp>.json  - Raw analysis JSON
 *   uploads/<userId>/<filename>                  - User uploads
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-2' });

const BUCKET_NAME = process.env.S3_BUCKET || 'aiready-platform-analysis';

// Types
export interface AnalysisUpload {
  userId: string;
  repoId: string;
  timestamp: string;
  data: unknown;
}

export interface AnalysisData {
  metadata: {
    repository: string;
    branch: string;
    commit: string;
    timestamp: string;
    toolVersion: string;
  };
  summary: {
    aiReadinessScore: number;
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  };
  breakdown: {
    semanticDuplicates: {
      score: number;
      count: number;
      details: Array<{
        type: string;
        file1: string;
        file2: string;
        similarity: number;
      }>;
    };
    contextFragmentation: {
      score: number;
      chains: Array<{
        file: string;
        chainLength: number;
        contextCost: number;
      }>;
    };
    namingConsistency: {
      score: number;
      inconsistencies: Array<{
        type: string;
        expected: string;
        actual: string;
        file: string;
      }>;
    };
    documentationHealth: {
      score: number;
      missingDocs: string[];
      outdatedDocs: string[];
    };
  };
  rawOutput?: unknown;
}

/**
 * Store raw analysis JSON in S3
 */
export async function storeAnalysis(analysis: AnalysisUpload): Promise<string> {
  const key = `analyses/${analysis.userId}/${analysis.repoId}/${analysis.timestamp}.json`;
  
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(analysis.data, null, 2),
    ContentType: 'application/json',
    Metadata: {
      userId: analysis.userId,
      repoId: analysis.repoId,
      timestamp: analysis.timestamp,
    },
  }));

  return key;
}

/**
 * Retrieve raw analysis JSON from S3
 */
export async function getAnalysis(key: string): Promise<AnalysisData | null> {
  try {
    const result = await s3.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));

    const body = await result.Body?.transformToString();
    if (!body) return null;

    return JSON.parse(body) as AnalysisData;
  } catch (error) {
    console.error('Error fetching analysis from S3:', error);
    return null;
  }
}

/**
 * Delete analysis from S3
 */
export async function deleteAnalysis(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }));
}

/**
 * List all analyses for a repository
 */
export async function listRepositoryAnalyses(userId: string, repoId: string): Promise<string[]> {
  const prefix = `analyses/${userId}/${repoId}/`;
  
  const result = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  }));

  return (result.Contents || [])
    .map(obj => obj.Key)
    .filter((key): key is string => key !== undefined);
}

/**
 * Generate a presigned URL for downloading analysis
 */
export async function getAnalysisDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Calculate AI Readiness Score from analysis data
 */
export function calculateAiScore(data: AnalysisData): number {
  // Weighted average of breakdown scores
  const weights = {
    semanticDuplicates: 0.35,
    contextFragmentation: 0.30,
    namingConsistency: 0.20,
    documentationHealth: 0.15,
  };

  const score = 
    data.breakdown.semanticDuplicates.score * weights.semanticDuplicates +
    data.breakdown.contextFragmentation.score * weights.contextFragmentation +
    data.breakdown.namingConsistency.score * weights.namingConsistency +
    data.breakdown.documentationHealth.score * weights.documentationHealth;

  return Math.round(score);
}

/**
 * Extract summary for DynamoDB storage
 */
export function extractSummary(data: AnalysisData) {
  return {
    totalFiles: data.summary.totalFiles,
    totalIssues: data.summary.totalIssues,
    criticalIssues: data.summary.criticalIssues,
    warnings: data.summary.warnings,
  };
}

/**
 * Extract breakdown for DynamoDB storage
 */
export function extractBreakdown(data: AnalysisData) {
  return {
    semanticDuplicates: data.breakdown.semanticDuplicates.score,
    contextFragmentation: data.breakdown.contextFragmentation.score,
    namingConsistency: data.breakdown.namingConsistency.score,
    documentationHealth: data.breakdown.documentationHealth.score,
  };
}

export { s3, BUCKET_NAME };
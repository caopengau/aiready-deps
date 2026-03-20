import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { doc, TABLE_NAME } from './client';
import { putItem, queryItems, PK, SK } from './helpers';
import type { RemediationRequest } from './types';

/**
 * Single-Table Design for Remediations:
 * PK: REPO#repoId
 * SK: REMEDIATION#id
 *
 * GSI1PK: REMEDIATION#id
 * GSI1SK: #METADATA  (to find by ID globally)
 *
 * GSI2PK: REMEDIATION#repoId
 * GSI2SK: createdAt (to list by repo)
 *
 * GSI3PK: TEAM#teamId
 * GSI3SK: REMEDIATION#id (to list by team)
 */

export async function createRemediation(
  remediation: RemediationRequest
): Promise<RemediationRequest> {
  const item = {
    PK: PK.repo(remediation.repoId),
    SK: SK.remediation(remediation.id),
    GSI1PK: PK.remediation(remediation.id),
    GSI1SK: SK.metadata,
    GSI2PK: PK.remediation(remediation.repoId),
    GSI2SK: remediation.createdAt,
    ...(remediation.teamId && {
      GSI3PK: PK.team(remediation.teamId),
      GSI3SK: SK.remediation(remediation.id),
    }),
    ...remediation,
  };
  await putItem(item);
  return remediation;
}

export async function createRemediations(
  repoId: string,
  requests: RemediationRequest[]
): Promise<void> {
  for (const req of requests) {
    await createRemediation({ ...req, repoId });
  }
}

export async function getRemediation(
  id: string
): Promise<RemediationRequest | null> {
  const items = await queryItems<RemediationRequest>({
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': PK.remediation(id) },
  });
  return items[0] || null;
}

export async function listRemediations(
  repoId: string,
  limit = 20
): Promise<RemediationRequest[]> {
  return queryItems<RemediationRequest>({
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2PK = :pk',
    ExpressionAttributeValues: { ':pk': PK.remediation(repoId) },
    ScanIndexForward: false,
    Limit: limit,
  });
}

export async function listTeamRemediations(
  teamId: string,
  limit = 20
): Promise<RemediationRequest[]> {
  return queryItems<RemediationRequest>({
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': PK.team(teamId) },
    ScanIndexForward: false,
    Limit: limit,
  });
}

export async function updateRemediation(
  id: string,
  updates: Partial<RemediationRequest>
): Promise<void> {
  const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
  const setExpressions: string[] = [];
  const values: Record<string, unknown> = {};
  const names: Record<string, string> = {};

  let idx = 0;
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'repoId') continue;
    const valKey = `:v${idx}`;
    const nameKey = `#n${idx}`;
    setExpressions.push(`${nameKey} = ${valKey}`);
    values[valKey] = value;
    names[nameKey] = key;
    idx++;
  }

  if (setExpressions.length === 0) return;

  // Get the remediation to find PK/SK
  const remediation = await getRemediation(id);
  if (!remediation) return;

  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: PK.repo(remediation.repoId), SK: SK.remediation(id) },
      UpdateExpression: `SET ${setExpressions.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: names,
    })
  );
}

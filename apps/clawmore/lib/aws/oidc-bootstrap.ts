import {
  IAMClient,
  CreateRoleCommand,
  CreateOpenIDConnectProviderCommand,
  GetOpenIDConnectProviderCommand,
  UpdateAssumeRolePolicyCommand,
  PutRolePolicyCommand,
} from '@aws-sdk/client-iam';
import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from '@aws-sdk/client-sts';
import { AWS_CONSTANTS } from '@aiready/core';

const stsClient = new STSClient({});

/**
 * Assumes the OrganizationAccountAccessRole in the sub-account and returns temporary credentials.
 *
 * @param accountId - The 12-digit AWS account ID to bootstrap
 * @returns Temporary security credentials for the target account
 */
export async function assumeSubAccountRole(accountId: string) {
  const roleArn = `arn:aws:iam::${accountId}:role/${AWS_CONSTANTS.IAM.ROLES.ORG_ACCESS}`;
  const maxRetries = 10;
  const delayMs = 15000; // 15 seconds between retries

  for (let i = 0; i < maxRetries; i++) {
    try {
      const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: AWS_CONSTANTS.IAM.ROLES.ORG_ACCESS + 'Session',
        DurationSeconds: 3600, // 1 hour
      });

      const response = await stsClient.send(command);

      if (!response.Credentials) {
        throw new Error('Failed to assume sub-account role: No credentials');
      }

      return {
        accessKeyId: response.Credentials.AccessKeyId!,
        secretAccessKey: response.Credentials.SecretAccessKey!,
        sessionToken: response.Credentials.SessionToken!,
      };
    } catch (error: any) {
      if (
        error.name === 'AccessDenied' ||
        error.name === 'InvalidIdentityToken'
      ) {
        console.log(
          `[AWS] Role ${roleArn} not yet assume-able (attempt ${i + 1}/${maxRetries}). Waiting...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Failed to assume sub-account role ${roleArn} after ${maxRetries} attempts`
  );
}

/**
 * Bootstraps a newly created managed account with OIDC trust for GitHub Actions.
 *
 * @param accountId - The 12-digit AWS account ID to bootstrap
 * @param githubOrg - The GitHub organization name (default: 'clawmost')
 * @param repoName - Optional specific repository name to restrict access
 * @returns The ARN of the created/updated IAM role
 */
export async function bootstrapManagedAccount(
  accountId: string,
  githubOrg: string = 'clawmost',
  repoName?: string
) {
  const credentials = await assumeSubAccountRole(accountId);
  const iamClient = new IAMClient({
    region: process.env.AWS_REGION || AWS_CONSTANTS.REGIONS.DEFAULT,
    credentials,
  });

  const rootStsClient = new STSClient({});
  const identity = await rootStsClient.send(new GetCallerIdentityCommand({}));
  const mainAccountId = identity.Account!;

  // 1. Create OIDC Provider for GitHub if it doesn't exist
  const providerArn = `arn:aws:iam::${accountId}:oidc-provider/${AWS_CONSTANTS.OIDC.GITHUB_PROVIDER}`;
  try {
    await iamClient.send(
      new GetOpenIDConnectProviderCommand({
        OpenIDConnectProviderArn: providerArn,
      })
    );
  } catch (error: any) {
    if (
      error.name === 'NoSuchEntity' ||
      error.name === 'NoSuchEntityException'
    ) {
      try {
        await iamClient.send(
          new CreateOpenIDConnectProviderCommand({
            Url: AWS_CONSTANTS.OIDC.GITHUB_URL,
            ClientIDList: [AWS_CONSTANTS.OIDC.AUDIENCE],
            ThumbprintList: AWS_CONSTANTS.OIDC.THUMBPRINTS,
          })
        );
      } catch (createErr: any) {
        if (createErr.name !== 'EntityAlreadyExists') throw createErr;
      }
    } else {
      throw error;
    }
  }

  const roleName = AWS_CONSTANTS.IAM.ROLES.GITHUB_ACTIONS;

  const sub = repoName
    ? `repo:${githubOrg}/${repoName}:*`
    : `repo:${githubOrg}/*:*`;

  const trustPolicy = {
    Version: AWS_CONSTANTS.IAM.POLICIES.VERSION,
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          Federated: providerArn,
        },
        Action: AWS_CONSTANTS.IAM.ACTIONS.ASSUME_ROLE_WEB,
        Condition: {
          StringLike: {
            [`${AWS_CONSTANTS.OIDC.GITHUB_PROVIDER}:sub`]: sub,
          },
          StringEquals: {
            [`${AWS_CONSTANTS.OIDC.GITHUB_PROVIDER}:aud`]:
              AWS_CONSTANTS.OIDC.AUDIENCE,
          },
        },
      },
      {
        Effect: 'Allow',
        Principal: {
          AWS: `arn:aws:iam::${mainAccountId}:root`,
        },
        Action: AWS_CONSTANTS.IAM.ACTIONS.ASSUME_ROLE,
      },
    ],
  };

  try {
    await iamClient.send(
      new CreateRoleCommand({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
        Description: 'OIDC role for GitHub Actions to deploy and evolve code.',
      })
    );
  } catch (error: any) {
    if (error.name === 'EntityAlreadyExists') {
      await iamClient.send(
        new UpdateAssumeRolePolicyCommand({
          RoleName: roleName,
          PolicyDocument: JSON.stringify(trustPolicy),
        })
      );
    } else {
      throw error;
    }
  }

  const deploymentPolicy = {
    Version: AWS_CONSTANTS.IAM.POLICIES.VERSION,
    Statement: [
      {
        Sid: 'LambdaFullAccess',
        Effect: 'Allow',
        Action: ['lambda:*'],
        Resource: '*',
      },
      {
        Sid: 'APIGatewayAccess',
        Effect: 'Allow',
        Action: ['apigateway:*'],
        Resource: '*',
      },
      {
        Sid: 'DynamoDBAccess',
        Effect: 'Allow',
        Action: ['dynamodb:*'],
        Resource: '*',
      },
      {
        Sid: 'S3Access',
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: '*',
      },
      {
        Sid: 'CloudFormationAccess',
        Effect: 'Allow',
        Action: ['cloudformation:*'],
        Resource: '*',
      },
      {
        Sid: 'IAMPassRoleAndManageRoles',
        Effect: 'Allow',
        Action: [
          'iam:PassRole',
          'iam:GetRole',
          'iam:CreateRole',
          'iam:DeleteRole',
          'iam:AttachRolePolicy',
          'iam:DetachRolePolicy',
          'iam:PutRolePolicy',
          'iam:DeleteRolePolicy',
          'iam:GetRolePolicy',
          'iam:ListRolePolicies',
          'iam:ListAttachedRolePolicies',
          'iam:ListInstanceProfilesForRole',
          'iam:CreateServiceLinkedRole',
        ],
        Resource: '*',
      },
      {
        Sid: 'CloudFrontAccess',
        Effect: 'Allow',
        Action: ['cloudfront:*'],
        Resource: '*',
      },
      {
        Sid: 'EventBridgeAccess',
        Effect: 'Allow',
        Action: ['events:*'],
        Resource: '*',
      },
      {
        Sid: 'SQSAccess',
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: '*',
      },
      {
        Sid: 'SNSAccess',
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: '*',
      },
      {
        Sid: 'CloudWatchLogsAccess',
        Effect: 'Allow',
        Action: ['logs:*'],
        Resource: '*',
      },
      {
        Sid: 'STSAccess',
        Effect: 'Allow',
        Action: [AWS_CONSTANTS.IAM.ACTIONS.GET_CALLER_IDENTITY],
        Resource: '*',
      },
      {
        Sid: 'DeniedServices',
        Effect: 'Deny',
        Action: [
          'organizations:*',
          'account:*',
          'billing:*',
          'ce:*',
          'savingsplans:*',
          'cur:*',
          'iam:DeleteUser',
          'iam:CreateUser',
          'iam:AttachUserPolicy',
          'iam:PutUserPolicy',
        ],
        Resource: '*',
      },
    ],
  };

  await iamClient.send(
    new PutRolePolicyCommand({
      RoleName: roleName,
      PolicyName: AWS_CONSTANTS.IAM.POLICIES.DEPLOY_NAME,
      PolicyDocument: JSON.stringify(deploymentPolicy),
    })
  );

  return `arn:aws:iam::${accountId}:role/${roleName}`;
}

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

export const githubTools = {
  createBranch: createTool({
    id: 'create-branch',
    description: 'Create a new branch in the repository',
    inputSchema: z.object({
      repoUrl: z.string().describe('The full URL of the repository'),
      branchName: z.string().describe('The name of the new branch'),
      baseBranch: z
        .string()
        .default('main')
        .describe('The base branch to branch off from'),
      githubToken: z.string().describe('GitHub Personal Access Token'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      branchName: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ repoUrl, branchName, baseBranch, githubToken }) => {
      try {
        const octokit = new Octokit({ auth: githubToken });
        const [owner, repo] = repoUrl
          .replace('https://github.com/', '')
          .split('/');

        // 1. Get the SHA of the base branch
        const { data: ref } = await octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${baseBranch}`,
        });

        // 2. Create the new branch
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: ref.object.sha,
        });

        return { success: true, branchName };
      } catch (error) {
        console.error('[GitHubTool] Error creating branch:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  }),

  createPullRequest: createTool({
    id: 'create-pr',
    description: 'Create a Pull Request for a branch',
    inputSchema: z.object({
      repoUrl: z.string().describe('The full URL of the repository'),
      title: z.string().describe('PR Title'),
      body: z.string().describe('PR Description/Body'),
      head: z.string().describe('The branch containing the changes'),
      base: z.string().default('main').describe('The branch to merge into'),
      githubToken: z.string().describe('GitHub Personal Access Token'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      prNumber: z.number().optional(),
      prUrl: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ repoUrl, title, body, head, base, githubToken }) => {
      try {
        const octokit = new Octokit({ auth: githubToken });
        const [owner, repo] = repoUrl
          .replace('https://github.com/', '')
          .split('/');

        const { data: pr } = await octokit.pulls.create({
          owner,
          repo,
          title,
          body,
          head,
          base: base || 'main',
        });

        return {
          success: true,
          prNumber: pr.number,
          prUrl: pr.html_url,
        };
      } catch (error) {
        console.error('[GitHubTool] Error creating PR:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  }),
};

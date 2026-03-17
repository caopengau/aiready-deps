import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

export const fsTools = {
  readFile: createTool({
    id: 'read-file',
    description: 'Read the contents of a file',
    inputSchema: z.object({
      rootDir: z.string(),
      filePath: z.string(),
    }),
    outputSchema: z.object({
      content: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ rootDir, filePath }) => {
      try {
        const fullPath = path.join(rootDir, filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        return { content };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  }),

  writeFile: createTool({
    id: 'write-file',
    description: 'Write contents to a file',
    inputSchema: z.object({
      rootDir: z.string(),
      filePath: z.string(),
      content: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      error: z.string().optional(),
    }),
    execute: async ({ rootDir, filePath, content }) => {
      try {
        const fullPath = path.join(rootDir, filePath);
        // Ensure directory exists
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  }),

  commitAndPush: createTool({
    id: 'commit-and-push',
    description: 'Commit all changes and push to a branch',
    inputSchema: z.object({
      rootDir: z.string(),
      branchName: z.string(),
      message: z.string(),
      githubToken: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      error: z.string().optional(),
    }),
    execute: async ({ rootDir, branchName, message, githubToken }) => {
      try {
        // 1. Add all changed files
        await git.add({ fs, dir: rootDir, filepath: '.' });

        // 2. Commit
        await git.commit({
          fs,
          dir: rootDir,
          message,
          author: {
            name: 'AIReady Remediation Agent',
            email: 'agents@getaiready.dev',
          },
        });

        // 3. Push
        await git.push({
          fs,
          http,
          dir: rootDir,
          ref: branchName,
          onAuth: () => ({ username: githubToken, password: '' }),
        });

        return { success: true };
      } catch (error) {
        console.error('[FSTool] Error during commit/push:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  }),
};

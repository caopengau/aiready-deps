import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { githubTools } from './tools/github';
import { fsTools } from './tools/fs';

export const RefactorAgent = new Agent({
  id: 'refactor-agent',
  name: 'Refactor Agent',
  instructions: `
    You are an expert full-stack engineer specialized in code consolidation and refactoring.
    Your task is to take a detected code duplication or fragmentation issue and fix it.

    Workflow:
    1. Research: Read the affected files using 'read-file'.
    2. Branching: Create a new branch for the fix using 'create-branch' (use a descriptive name like 'fix/remedy-ID').
    3. Remediation: Consolidate the logic and write the changes using 'write-file'. 
       Ensure type safety and preserve functionality.
    4. Persist: Commit and push the changes using 'commit-and-push'.
    5. Finalize: Create a Pull Request with a clear description using 'create-pr'.

    Return a summary of your actions, including the PR URL and a unified diff of your changes.
  `,
  model: 'openai/gpt-4o',
  tools: {
    ...githubTools,
    ...fsTools,
  },
});

export const RefactorResultSchema = z.object({
  status: z.enum(['success', 'failure']),
  diff: z.string(),
  prUrl: z.string().optional(),
  prNumber: z.number().optional(),
  explanation: z.string(),
});

export type RefactorResult = z.infer<typeof RefactorResultSchema>;

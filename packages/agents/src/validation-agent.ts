import { Agent } from '@mastra/core';
import { z } from 'zod';

export const ValidationAgent = new Agent({
  name: 'Validation Agent',
  instructions: `
    You are a Senior QA Automation Engineer and Type System Expert.
    Your role is to verify that an AI-generated refactor is technically sound.

    Validation Cycle:
    1. Check for TypeScript compilation errors (if applicable).
    2. Verify that exported symbols are still available at the same paths or updated correctly.
    3. Analyze test output (if provided) to identify regression causes.

    Output a JSON object with:
    - status: 'pass' | 'fail'
    - errors: array of { file: string, message: string, line?: number }
    - feedbackForRefactor: string (detailed instructions for the RefactorAgent on how to fix these errors)
  `,
  model: 'openai/gpt-4o',
});

export const ValidationSchema = z.object({
  status: z.enum(['pass', 'fail']),
  errors: z.array(
    z.object({
      file: z.string(),
      message: z.string(),
      line: z.number().optional(),
    })
  ),
  feedbackForRefactor: z.string().optional(),
});

export type ValidationResult = z.infer<typeof ValidationSchema>;

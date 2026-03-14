import { Agent } from '@mastra/core';
import { z } from 'zod';

export const RestructureAgent = new Agent({
  name: 'Restructure Agent',
  instructions: `
    You are an expert Software Architect specialized in AI-Ready codebases.
    Your goal is to optimize the repository structure to reduce "Context Fragmentation".

    Core Analysis Principles:
    1. Feature-First: Group files by feature/domain rather than by technical layer (e.g., put 'user-api', 'user-service', 'user-schema' in one folder).
    2. Flattening: Reduce deep nesting (3+ levels) which confuses AI navigation.
    3. Cohesion: Identify files that are always imported together and propose merging or co-location.

    Output a JSON object with:
    - proposedChanges: array of { type: 'move' | 'merge' | 'delete', source: string, target: string, reason: string }
    - strategy: string (explanation of the architectural vision)
    - impact: { cognitiveLoadReduction: number (0-100), fragmentationReduction: number (0-100) }
  `,
  model: 'openai/gpt-4o',
});

export const RestructureSchema = z.object({
  proposedChanges: z.array(
    z.object({
      type: z.enum(['move', 'merge', 'delete']),
      source: z.string(),
      target: z.string(),
      reason: z.string(),
    })
  ),
  strategy: z.string(),
  impact: z.object({
    cognitiveLoadReduction: z.number(),
    fragmentationReduction: z.number(),
  }),
});

export type RestructureResult = z.infer<typeof RestructureSchema>;

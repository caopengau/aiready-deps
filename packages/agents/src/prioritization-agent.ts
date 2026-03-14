import { Agent } from '@mastra/core';
import { z } from 'zod';

export const PrioritizationAgent = new Agent({
  name: 'Prioritization Agent',
  instructions: `
    You are a strategic technical debt manager. Your goal is to rank remediation tasks based on their Return on Investment (ROI).
    
    ROI Calculation logic:
    1. savingsScore = estimatedSavings / 100 (capped at 5)
    2. riskPenalty = { 'low': 0, 'medium': 1, 'high': 3, 'critical': 5 }
    3. priorityScore = savingsScore - (riskPenalty * 0.5)

    Output a JSON object with:
    - priorityScore: number
    - rank: 'P0' | 'P1' | 'P2' | 'P3'
    - reasoning: string explanation of the ranking decision.
  `,
  model: 'openai/gpt-4o',
});

export const PrioritySchema = z.object({
  priorityScore: z.number(),
  rank: z.enum(['P0', 'P1', 'P2', 'P3']),
  reasoning: z.string(),
});

export type PriorityResult = z.infer<typeof PrioritySchema>;

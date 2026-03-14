import { Workflow } from '@mastra/core';
import { z } from 'zod';
import { PrioritizationAgent } from '../prioritization-agent';
import { ImpactAgent } from '../impact-agent';
import { RestructureAgent } from '../restructure-agent';
import { RefactorAgent } from '../refactor-agent';
import { ValidationAgent } from '../validation-agent';

export const RemediationSwarm = new Workflow({
  id: 'remediation-swarm',
  inputSchema: z.any(),
  outputSchema: z.any(),
})
  .then(PrioritizationAgent as any)
  .then(ImpactAgent as any)
  .then(RestructureAgent as any)
  .then(RefactorAgent as any)
  .then(ValidationAgent as any);

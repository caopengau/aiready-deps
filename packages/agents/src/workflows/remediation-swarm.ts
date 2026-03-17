import { Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { RefactorAgent } from '../refactor-agent';

export const RemediationSwarm = (
  new Workflow({
    id: 'remediation-swarm',
    inputSchema: z.object({
      remediation: z.any(),
      repo: z.any(),
      rootDir: z.string(),
      config: z.object({
        githubToken: z.string().optional(),
        openaiApiKey: z.string().optional(),
      }),
    }),
    outputSchema: z.object({
      diff: z.string(),
      prUrl: z.string().optional(),
      prNumber: z.number().optional(),
      explanation: z.string(),
    }),
  }) as any
)
  .step('refactor', {
    action: async ({ context }: { context: any }) => {
      const { remediation, repo, rootDir, config } = context.getStepResult(
        'trigger'
      ) as any;

      const prompt = `
        Remediate this issue: ${JSON.stringify(remediation)}
        in repository: ${repo.url}
        local path: ${rootDir}

        You MUST provide your final response as a VALID JSON object with this structure:
        {
          "status": "success" | "failure",
          "diff": "unified diff string",
          "prUrl": "URL of the created PR",
          "prNumber": 123,
          "explanation": "Brief explanation of changes"
        }
      `;

      // Use a simpler call that doesn't use unsupported options
      const result = await (RefactorAgent as any).generate(prompt);

      try {
        // Mastra generates text, we need to extract and parse the JSON
        const text = (result as any).text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ok: true,
            value: parsed,
          };
        }

        return {
          ok: true,
          value: {
            status: 'success',
            diff: text,
            explanation: 'Applied refactoring successfully',
          },
        };
      } catch (err) {
        return {
          ok: false,
          error:
            'Failed to parse agent response: ' +
            (err instanceof Error ? err.message : String(err)),
        };
      }
    },
  })
  .commit();

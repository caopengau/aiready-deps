import { describe, it, expect, vi } from 'vitest';
import { AiSignalClarityProvider } from '../provider';
import * as analyzer from '../analyzer';

vi.mock('../analyzer', () => ({
  analyzeAiSignalClarity: vi.fn(),
}));

describe('AI Signal Clarity Provider', () => {
  it('should analyze and return SpokeOutput', async () => {
    vi.mocked(analyzer.analyzeAiSignalClarity).mockResolvedValue({
      summary: { filesAnalyzed: 1 } as any,
      results: [],
      aggregateSignals: {} as any,
      recommendations: [],
    });

    const output = await AiSignalClarityProvider.analyze({ rootDir: '.' });

    expect(output.summary.filesAnalyzed).toBe(1);
    expect(output.metadata!.toolName).toBe('ai-signal-clarity');
  });

  it('should score an output', () => {
    const mockOutput = {
      summary: { score: 80 } as any,
      metadata: { aggregateSignals: {} },
      results: [],
    };

    const scoring = AiSignalClarityProvider.score(mockOutput as any, {
      rootDir: '.',
    });
    expect(scoring.score).toBeDefined();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { PatternDetectProvider } from '../provider';
import * as analyzer from '../analyzer';

vi.mock('../analyzer', async () => {
  const actual = await vi.importActual('../analyzer');
  return {
    ...actual,
    analyzePatterns: vi.fn(),
  };
});

describe('Pattern Detect Provider', () => {
  it('should analyze and return SpokeOutput', async () => {
    vi.mocked(analyzer.analyzePatterns).mockResolvedValue({
      results: [],
      duplicates: [],
      files: ['f1.ts'],
      config: { rootDir: '.' },
    } as any);

    const output = await PatternDetectProvider.analyze({ rootDir: '.' });

    expect(output.summary.totalFiles).toBe(1);
    expect(output.metadata!.toolName).toBe('pattern-detect');
  });

  it('should include duplicates in summary for scoring', async () => {
    vi.mocked(analyzer.analyzePatterns).mockResolvedValue({
      results: [],
      duplicates: [
        { file1: 'f1.ts', file2: 'f2.ts', similarity: 0.9, tokenCost: 100 },
      ],
      files: ['f1.ts', 'f2.ts'],
      config: { rootDir: '.' },
    } as any);

    const output = await PatternDetectProvider.analyze({ rootDir: '.' });

    expect(output.summary.duplicates).toBeDefined();
    expect(output.summary.duplicates).toHaveLength(1);
  });

  it('should score an output correctly when duplicates are present', () => {
    const mockOutput = {
      summary: {
        totalFiles: 10,
        duplicates: [
          { file1: 'f1.ts', file2: 'f2.ts', similarity: 0.95, tokenCost: 2000 },
        ],
      } as any,
      results: [],
    };

    const scoring = PatternDetectProvider.score(mockOutput as any, {
      rootDir: '.',
    });

    // With a high-impact duplicate and high density, score should be less than 100
    expect(scoring.score).toBeLessThan(100);
    expect(scoring.rawMetrics.totalDuplicates).toBe(1);
  });

  it('should score an output', () => {
    const mockOutput = {
      summary: { totalFiles: 10, duplicates: [] } as any,
      results: [],
    };

    const scoring = PatternDetectProvider.score(mockOutput as any, {
      rootDir: '.',
    });
    expect(scoring.score).toBeDefined();
  });
});

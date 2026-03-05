import { describe, it, expect, vi } from 'vitest';
import { analyzeAiSignalClarity } from '../index';
import { validateSpokeOutput } from '../../../core/src/types/contract';

// Mock core functions
vi.mock('@aiready/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aiready/core')>();
  return {
    ...actual,
    scanFiles: vi.fn().mockResolvedValue(['file1.ts']),
    readFileContent: vi
      .fn()
      .mockResolvedValue(
        'function problematic() { let a = 1; if (a) { if (a) { return a; } } }'
      ),
  };
});

describe('AI Signal Clarity Contract Validation', () => {
  it('should produce output matching the SpokeOutput contract', async () => {
    const results = await analyzeAiSignalClarity({
      rootDir: './test',
    } as any);

    const fullOutput = {
      results: results.results,
      summary: results.summary,
    };

    const validation = validateSpokeOutput('ai-signal-clarity', fullOutput);

    if (!validation.valid) {
      console.error('Contract Validation Errors:', validation.errors);
    }

    expect(validation.valid).toBe(true);
  });
});

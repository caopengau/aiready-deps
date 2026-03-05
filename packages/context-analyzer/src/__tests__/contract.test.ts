import { describe, it, expect, vi } from 'vitest';
import { analyzeContext, generateSummary } from '../index';
import { validateSpokeOutput } from '../../../core/src/types/contract';

// Mock core functions
vi.mock('@aiready/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aiready/core')>();
  return {
    ...actual,
    scanFiles: vi.fn().mockResolvedValue(['file1.ts']),
    readFileContent: vi
      .fn()
      .mockResolvedValue('import { a } from "./b"; export const x = 1;'),
  };
});

describe('Context Analyzer Contract Validation', () => {
  it('should produce output matching the SpokeOutput contract', async () => {
    const results = await analyzeContext({
      rootDir: './test',
    } as any);

    const summary = generateSummary(results);

    const fullOutput = {
      results,
      summary,
    };

    const validation = validateSpokeOutput('context-analyzer', fullOutput);

    if (!validation.valid) {
      console.error('Contract Validation Errors:', validation.errors);
    }

    expect(validation.valid).toBe(true);
  });
});

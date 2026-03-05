import { describe, it, expect, vi } from 'vitest';
import { analyzePatterns, generateSummary } from '../index';
// Import directly from source to avoid mock issues with barrel exports
import { validateSpokeOutput } from '../../../core/src/types/contract';

// Mock core functions to avoid actual FS access
vi.mock('@aiready/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aiready/core')>();
  return {
    ...actual,
    scanFiles: vi.fn().mockResolvedValue(['file1.ts', 'file2.ts']),
    readFileContent: vi.fn().mockImplementation((file) => {
      if (file === 'file1.ts') return 'function test() { return 1; }';
      if (file === 'file2.ts') return 'function test() { return 1; }';
      return '';
    }),
  };
});

describe('Pattern Detect Contract Validation', () => {
  it('should produce output matching the SpokeOutput contract', async () => {
    const output = await analyzePatterns({
      rootDir: './test',
      minSimilarity: 0.5,
      suppressToolConfig: true,
    } as any);

    const summary = generateSummary(output.results);

    const fullOutput = {
      results: output.results,
      summary,
    };

    const validation = validateSpokeOutput('pattern-detect', fullOutput);

    if (!validation.valid) {
      console.error('Contract Validation Errors:', validation.errors);
    }

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { DEPS_PROVIDER } from '../provider';
import { validateSpokeOutput } from '@aiready/core';

// Mock core functions to avoid actual FS access
vi.mock('@aiready/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aiready/core')>();
  return {
    ...actual,
    scanFiles: vi.fn().mockResolvedValue(['package.json']),
    readFileContent: vi.fn().mockImplementation((file) => {
      if (file === 'package.json') {
        return JSON.stringify({
          dependencies: {
            lodash: '^4.17.21',
          },
        });
      }
      return '';
    }),
  };
});

describe('Deps Contract Validation', () => {
  it('should produce output matching the SpokeOutput contract', async () => {
    const options = {
      rootDir: './test',
    };

    const output = await DEPS_PROVIDER.analyze(options);

    // 1. Structural Validation
    const validation = validateSpokeOutput('deps-health', output);
    if (!validation.valid) {
      console.error('Contract Validation Errors:', validation.errors);
    }
    expect(validation.valid).toBe(true);

    // 2. Scoring Validation
    const score = DEPS_PROVIDER.score(output, options);
    expect(score).toBeDefined();
    expect(typeof score.score).toBe('number');
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});

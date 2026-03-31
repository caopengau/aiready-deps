import { describe, it, expect } from 'vitest';
import { DEPS_PROVIDER } from '../provider';

describe('Deps Provider', () => {
  it('should have correct ID', () => {
    expect(DEPS_PROVIDER.id).toBe('deps');
  });

  it('should have alias', () => {
    expect(DEPS_PROVIDER.alias).toContain('dependency-health');
  });
});

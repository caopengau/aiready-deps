import { describe, it, expect } from 'vitest';
import { jaccardSimilarity } from '../core/similarity';

describe('jaccardSimilarity', () => {
  it('should return 0 for empty arrays', () => {
    expect(jaccardSimilarity([], [])).toBe(0);
  });

  it('should calculate similarity for identical token arrays', () => {
    const tokens = ['foo', 'bar', 'baz'];
    expect(jaccardSimilarity(tokens, tokens)).toBe(1);
  });

  it('should calculate similarity for disjoint arrays', () => {
    const tokens1 = ['foo', 'bar'];
    const tokens2 = ['baz', 'qux'];
    expect(jaccardSimilarity(tokens1, tokens2)).toBe(0);
  });

  it('should calculate similarity for partially overlapping arrays', () => {
    const tokens1 = ['foo', 'bar', 'baz'];
    const tokens2 = ['bar', 'baz', 'qux'];
    // intersection = 2, union = 4, similarity = 0.5
    expect(jaccardSimilarity(tokens1, tokens2)).toBe(0.5);
  });

  it('should handle empty first array', () => {
    const tokens1: string[] = [];
    const tokens2 = ['foo', 'bar'];
    expect(jaccardSimilarity(tokens1, tokens2)).toBe(0);
  });

  it('should handle empty second array', () => {
    const tokens1 = ['foo', 'bar'];
    const tokens2: string[] = [];
    expect(jaccardSimilarity(tokens1, tokens2)).toBe(0);
  });

  it('should handle duplicate tokens in arrays', () => {
    const tokens1 = ['foo', 'foo', 'bar'];
    const tokens2 = ['foo', 'bar', 'bar'];
    // Sets: {foo, bar} ∩ {foo, bar} = 2, union = 2, similarity = 1
    expect(jaccardSimilarity(tokens1, tokens2)).toBe(1);
  });

  it('should handle single element arrays', () => {
    expect(jaccardSimilarity(['foo'], ['foo'])).toBe(1);
    expect(jaccardSimilarity(['foo'], ['bar'])).toBe(0);
    // intersection = 1, union = 2, similarity = 0.5
    expect(jaccardSimilarity(['foo'], ['foo', 'bar'])).toBe(0.5);
  });
});

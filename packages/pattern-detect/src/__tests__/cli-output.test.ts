import { describe, it, expect } from 'vitest';
import { getPatternIcon, generateHTMLReport } from '../cli-output';

describe('getPatternIcon', () => {
  it('should return correct icon for api-handler', () => {
    expect(getPatternIcon('api-handler')).toBe('🔌');
  });

  it('should return correct icon for validator', () => {
    expect(getPatternIcon('validator')).toBe('🛡️');
  });

  it('should return correct icon for utility', () => {
    expect(getPatternIcon('utility')).toBe('⚙️');
  });

  it('should return correct icon for class-method', () => {
    expect(getPatternIcon('class-method')).toBe('🏛️');
  });

  it('should return correct icon for component', () => {
    expect(getPatternIcon('component')).toBe('🧩');
  });

  it('should return correct icon for function', () => {
    expect(getPatternIcon('function')).toBe('𝑓');
  });

  it('should return unknown icon for unknown type', () => {
    expect(getPatternIcon('unknown')).toBe('❓');
  });

  it('should return unknown icon for unrecognized type', () => {
    expect(getPatternIcon('custom-type')).toBe('❓');
  });

  it('should return unknown icon for empty string', () => {
    expect(getPatternIcon('')).toBe('❓');
  });
});

describe('generateHTMLReport', () => {
  const mockResults = {
    results: [],
    summary: {
      totalFiles: 10,
      totalIssues: 5,
      duplicates: [
        {
          similarity: 0.95,
          patternType: 'function',
          files: [
            { path: 'src/a.ts', startLine: 1, endLine: 10 },
            { path: 'src/b.ts', startLine: 5, endLine: 15 },
          ],
          tokenCost: 100,
        },
      ],
    },
    metadata: {
      version: '0.11.22',
    },
  };

  it('should generate HTML report string', () => {
    const html = generateHTMLReport(mockResults);
    expect(typeof html).toBe('string');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Pattern Detection Report');
  });

  it('should include duplicate information', () => {
    const html = generateHTMLReport(mockResults);
    expect(html).toContain('95%');
    expect(html).toContain('function');
    expect(html).toContain('src/a.ts');
    expect(html).toContain('src/b.ts');
  });

  it('should handle empty duplicates', () => {
    const emptyResults = {
      results: [],
      summary: {
        totalFiles: 10,
        totalIssues: 0,
        duplicates: [],
      },
      metadata: {
        version: '0.11.22',
      },
    };
    const html = generateHTMLReport(emptyResults);
    expect(html).toContain('Pattern Detection Report');
    expect(html).toContain('100%'); // Perfect score with no duplicates
  });

  it('should support legacy summary parameter', () => {
    const results = { results: [] };
    const summary = {
      totalFiles: 5,
      totalIssues: 2,
      duplicates: [],
    };
    const html = generateHTMLReport(results, summary);
    expect(html).toContain('Pattern Detection Report');
  });
});

import { describe, it, expect } from 'vitest';
import type { CodeBlock, DuplicatePattern, DetectionOptions, PatternType } from '../core/types';
import { Severity } from '@aiready/core';

describe('Core Types', () => {
  describe('PatternType', () => {
    it('should accept valid pattern types', () => {
      const validTypes: PatternType[] = [
        'api-handler',
        'validator',
        'utility',
        'class-method',
        'component',
        'function',
        'unknown',
      ];

      validTypes.forEach((type) => {
        const block: CodeBlock = {
          file: 'test.ts',
          startLine: 1,
          endLine: 5,
          code: '',
          patternType: type,
        };
        expect(block.patternType).toBe(type);
      });
    });
  });

  describe('CodeBlock', () => {
    it('should create a valid CodeBlock', () => {
      const block: CodeBlock = {
        file: 'src/utils/helper.ts',
        startLine: 10,
        endLine: 20,
        code: 'function helper() {}',
        patternType: 'function',
      };

      expect(block.file).toBe('src/utils/helper.ts');
      expect(block.startLine).toBe(10);
      expect(block.endLine).toBe(20);
      expect(block.code).toBe('function helper() {}');
      expect(block.patternType).toBe('function');
    });

    it('should accept string patternType for extensibility', () => {
      const block: CodeBlock = {
        file: 'test.ts',
        startLine: 1,
        endLine: 5,
        code: '',
        patternType: 'custom-pattern',
      };
      expect(block.patternType).toBe('custom-pattern');
    });
  });

  describe('DuplicatePattern', () => {
    it('should create a valid DuplicatePattern', () => {
      const pattern: DuplicatePattern = {
        file1: 'src/a.ts',
        line1: 1,
        endLine1: 10,
        file2: 'src/b.ts',
        line2: 5,
        endLine2: 15,
        code1: 'function a() {}',
        code2: 'function b() {}',
        similarity: 0.95,
        confidence: 0.85,
        patternType: 'function',
        tokenCost: 100,
        severity: Severity.Major,
      };

      expect(pattern.similarity).toBe(0.95);
      expect(pattern.confidence).toBe(0.85);
      expect(pattern.tokenCost).toBe(100);
      expect(pattern.severity).toBe(Severity.Major);
    });

    it('should have optional fields', () => {
      const pattern: DuplicatePattern = {
        file1: 'src/a.ts',
        line1: 1,
        endLine1: 10,
        file2: 'src/b.ts',
        line2: 5,
        endLine2: 15,
        code1: 'function a() {}',
        code2: 'function b() {}',
        similarity: 0.95,
        confidence: 0.85,
        patternType: 'function',
        tokenCost: 100,
        severity: Severity.Major,
        reason: 'Similar logic',
        suggestion: 'Consider extracting to shared utility',
        matchedRule: 'high-similarity',
      };

      expect(pattern.reason).toBe('Similar logic');
      expect(pattern.suggestion).toBe('Consider extracting to shared utility');
      expect(pattern.matchedRule).toBe('high-similarity');
    });
  });

  describe('DetectionOptions', () => {
    it('should create valid DetectionOptions', () => {
      const options: DetectionOptions = {
        minSimilarity: 0.8,
        minLines: 5,
        batchSize: 100,
        approx: true,
        minSharedTokens: 3,
        maxCandidatesPerBlock: 50,
        streamResults: false,
      };

      expect(options.minSimilarity).toBe(0.8);
      expect(options.minLines).toBe(5);
      expect(options.batchSize).toBe(100);
      expect(options.approx).toBe(true);
      expect(options.minSharedTokens).toBe(3);
      expect(options.maxCandidatesPerBlock).toBe(50);
      expect(options.streamResults).toBe(false);
    });

    it('should have optional fields', () => {
      const options: DetectionOptions = {
        minSimilarity: 0.8,
        minLines: 5,
        batchSize: 100,
        approx: true,
        minSharedTokens: 3,
        maxCandidatesPerBlock: 50,
        streamResults: false,
        excludePatterns: ['**/*.test.ts'],
        confidenceThreshold: 0.7,
        ignoreWhitelist: ['src/generated/**'],
        onProgress: (processed, total, message) => {
          console.log(`${processed}/${total}: ${message}`);
        },
      };

      expect(options.excludePatterns).toEqual(['**/*.test.ts']);
      expect(options.confidenceThreshold).toBe(0.7);
      expect(options.ignoreWhitelist).toEqual(['src/generated/**']);
      expect(typeof options.onProgress).toBe('function');
    });
  });
});

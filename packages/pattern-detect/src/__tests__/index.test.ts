import { describe, it, expect } from 'vitest';
import * as patternDetect from '../index';

describe('pattern-detect index', () => {
  describe('exports', () => {
    it('should export PatternDetectProvider', () => {
      expect(patternDetect.PatternDetectProvider).toBeDefined();
      expect(patternDetect.PatternDetectProvider.id).toBe('pattern-detect');
    });

    it('should export Severity from @aiready/core', () => {
      expect(patternDetect.Severity).toBeDefined();
      expect(patternDetect.Severity.Critical).toBeDefined();
      expect(patternDetect.Severity.Major).toBeDefined();
      expect(patternDetect.Severity.Minor).toBeDefined();
      expect(patternDetect.Severity.Info).toBeDefined();
    });

    it('should export analyzer functions', () => {
      expect(typeof patternDetect.analyzePatterns).toBe('function');
    });

    it('should export detector functions', () => {
      expect(typeof patternDetect.detectDuplicatePatterns).toBe('function');
    });

    it('should export grouping functions', () => {
      expect(typeof patternDetect.groupDuplicatesByFilePair).toBe('function');
      expect(typeof patternDetect.createRefactorClusters).toBe('function');
      expect(typeof patternDetect.filterClustersByImpact).toBe('function');
    });

    it('should export scoring functions', () => {
      expect(typeof patternDetect.calculatePatternScore).toBe('function');
    });

    it('should export context-rules functions', () => {
      expect(typeof patternDetect.calculateSeverity).toBe('function');
      expect(typeof patternDetect.filterBySeverity).toBe('function');
      expect(typeof patternDetect.getSeverityLabel).toBe('function');
    });
  });

  describe('PatternDetectProvider', () => {
    it('should have required provider methods', () => {
      expect(typeof patternDetect.PatternDetectProvider.analyze).toBe('function');
      expect(typeof patternDetect.PatternDetectProvider.score).toBe('function');
    });

    it('should have alias array', () => {
      expect(Array.isArray(patternDetect.PatternDetectProvider.alias)).toBe(true);
      expect(patternDetect.PatternDetectProvider.alias).toContain('patterns');
      expect(patternDetect.PatternDetectProvider.alias).toContain('duplicates');
      expect(patternDetect.PatternDetectProvider.alias).toContain('duplication');
    });

    it('should have defaultWeight', () => {
      expect(typeof patternDetect.PatternDetectProvider.defaultWeight).toBe('number');
      expect(patternDetect.PatternDetectProvider.defaultWeight).toBeGreaterThan(0);
    });
  });
});

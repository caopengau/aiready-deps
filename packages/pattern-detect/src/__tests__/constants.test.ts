import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MIN_SIMILARITY,
  DEFAULT_MIN_LINES,
  DEFAULT_BATCH_SIZE,
  DEFAULT_MIN_SHARED_TOKENS,
  DEFAULT_MAX_CANDIDATES_PER_BLOCK,
  DEFAULT_MAX_RESULTS,
  DEFAULT_MIN_CLUSTER_TOKEN_COST,
  DEFAULT_MIN_CLUSTER_FILES,
  COMMAND_NAME,
  COMMAND_VERSION,
  DEFAULT_OUTPUT_FORMAT,
  HELP_TEXT_AFTER,
} from '../constants';

describe('Constants', () => {
  describe('Default Configuration Values', () => {
    it('should have DEFAULT_MIN_SIMILARITY as 0.4', () => {
      expect(DEFAULT_MIN_SIMILARITY).toBe(0.4);
    });

    it('should have DEFAULT_MIN_LINES as 5', () => {
      expect(DEFAULT_MIN_LINES).toBe(5);
    });

    it('should have DEFAULT_BATCH_SIZE as 100', () => {
      expect(DEFAULT_BATCH_SIZE).toBe(100);
    });

    it('should have DEFAULT_MIN_SHARED_TOKENS as 8', () => {
      expect(DEFAULT_MIN_SHARED_TOKENS).toBe(8);
    });

    it('should have DEFAULT_MAX_CANDIDATES_PER_BLOCK as 100', () => {
      expect(DEFAULT_MAX_CANDIDATES_PER_BLOCK).toBe(100);
    });

    it('should have DEFAULT_MAX_RESULTS as 10', () => {
      expect(DEFAULT_MAX_RESULTS).toBe(10);
    });

    it('should have DEFAULT_MIN_CLUSTER_TOKEN_COST as 1000', () => {
      expect(DEFAULT_MIN_CLUSTER_TOKEN_COST).toBe(1000);
    });

    it('should have DEFAULT_MIN_CLUSTER_FILES as 3', () => {
      expect(DEFAULT_MIN_CLUSTER_FILES).toBe(3);
    });
  });

  describe('Command Configuration', () => {
    it('should have COMMAND_NAME as aiready-patterns', () => {
      expect(COMMAND_NAME).toBe('aiready-patterns');
    });

    it('should have COMMAND_VERSION as 0.1.0', () => {
      expect(COMMAND_VERSION).toBe('0.1.0');
    });

    it('should have DEFAULT_OUTPUT_FORMAT as console', () => {
      expect(DEFAULT_OUTPUT_FORMAT).toBe('console');
    });
  });

  describe('Help Text', () => {
    it('should include CONFIGURATION section', () => {
      expect(HELP_TEXT_AFTER).toContain('CONFIGURATION:');
      expect(HELP_TEXT_AFTER).toContain('aiready.json');
    });

    it('should include PARAMETER TUNING section', () => {
      expect(HELP_TEXT_AFTER).toContain('PARAMETER TUNING:');
      expect(HELP_TEXT_AFTER).toContain('--similarity');
    });

    it('should include EXAMPLES section', () => {
      expect(HELP_TEXT_AFTER).toContain('EXAMPLES:');
      expect(HELP_TEXT_AFTER).toContain('aiready-patterns .');
    });
  });

  describe('Numeric Ranges', () => {
    it('should have similarity between 0 and 1', () => {
      expect(DEFAULT_MIN_SIMILARITY).toBeGreaterThan(0);
      expect(DEFAULT_MIN_SIMILARITY).toBeLessThan(1);
    });

    it('should have positive integer defaults', () => {
      expect(Number.isInteger(DEFAULT_MIN_LINES)).toBe(true);
      expect(Number.isInteger(DEFAULT_BATCH_SIZE)).toBe(true);
      expect(Number.isInteger(DEFAULT_MIN_SHARED_TOKENS)).toBe(true);
      expect(Number.isInteger(DEFAULT_MAX_CANDIDATES_PER_BLOCK)).toBe(true);
      expect(Number.isInteger(DEFAULT_MAX_RESULTS)).toBe(true);
      expect(Number.isInteger(DEFAULT_MIN_CLUSTER_TOKEN_COST)).toBe(true);
      expect(Number.isInteger(DEFAULT_MIN_CLUSTER_FILES)).toBe(true);
    });

    it('should have all defaults greater than 0', () => {
      expect(DEFAULT_MIN_LINES).toBeGreaterThan(0);
      expect(DEFAULT_BATCH_SIZE).toBeGreaterThan(0);
      expect(DEFAULT_MIN_SHARED_TOKENS).toBeGreaterThan(0);
      expect(DEFAULT_MAX_CANDIDATES_PER_BLOCK).toBeGreaterThan(0);
      expect(DEFAULT_MAX_RESULTS).toBeGreaterThan(0);
      expect(DEFAULT_MIN_CLUSTER_TOKEN_COST).toBeGreaterThan(0);
      expect(DEFAULT_MIN_CLUSTER_FILES).toBeGreaterThan(0);
    });
  });
});

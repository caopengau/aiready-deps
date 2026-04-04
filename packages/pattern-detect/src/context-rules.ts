import {
  IssueType,
  getSeverityLabel,
  filterBySeverity,
  Severity,
} from '@aiready/core';
import { ContextRule } from './rules/types';
import { TEST_RULES } from './rules/categories/test-rules';
import { WEB_RULES } from './rules/categories/web-rules';
import { INFRA_RULES } from './rules/categories/infra-rules';
import { LOGIC_RULES } from './rules/categories/logic-rules';

export { IssueType, getSeverityLabel, filterBySeverity, Severity };
export type { ContextRule };

/**
 * Context rules for detecting intentional or acceptable duplication patterns
 * Rules are checked in order - first match wins
 */
export const CONTEXT_RULES: ContextRule[] = [
  ...TEST_RULES,
  ...WEB_RULES,
  ...INFRA_RULES,
  ...LOGIC_RULES,
];

/**
 * Calculate severity based on context rules and code characteristics
 *
 * @param file1 - First file path in the duplicate pair.
 * @param file2 - Second file path in the duplicate pair.
 * @param code - Snippet of the duplicated code.
 * @param similarity - The calculated similarity score (0-1).
 * @param linesOfCode - Number of lines in the duplicated block.
 * @returns An object containing the severity level and reasoning.
 */
export function calculateSeverity(
  file1: string,
  file2: string,
  code: string,
  similarity: number,
  linesOfCode: number
): {
  severity: Severity;
  reason?: string;
  suggestion?: string;
  matchedRule?: string;
} {
  // Check context rules in priority order (first match wins)
  for (const rule of CONTEXT_RULES) {
    if (rule.detect(file1, code) || rule.detect(file2, code)) {
      return {
        severity: rule.severity,
        reason: rule.reason,
        suggestion: rule.suggestion,
        matchedRule: rule.name,
      };
    }
  }

  // Default severity based on similarity and size for non-contextual duplicates
  if (similarity >= 0.95 && linesOfCode >= 30) {
    return {
      severity: Severity.Critical,
      reason:
        'Large nearly-identical code blocks waste tokens and create maintenance burden',
      suggestion: 'Extract to shared utility module immediately',
    };
  } else if (similarity >= 0.95 && linesOfCode >= 15) {
    return {
      severity: Severity.Major,
      reason: 'Nearly identical code should be consolidated',
      suggestion: 'Move to shared utility file',
    };
  } else if (similarity >= 0.85 && linesOfCode >= 10) {
    return {
      severity: Severity.Major,
      reason: 'High similarity indicates significant duplication',
      suggestion: 'Extract common logic to shared function',
    };
  } else if (similarity >= 0.7) {
    return {
      severity: Severity.Minor,
      reason: 'Moderate similarity detected',
      suggestion:
        'Consider extracting shared patterns if code evolves together',
    };
  } else {
    return {
      severity: Severity.Minor,
      reason: 'Minor similarity detected',
      suggestion: 'Monitor but refactoring may not be worthwhile',
    };
  }
}

/**
 * Get numerical similarity threshold associated with a severity level
 *
 * @param severity - The severity level to look up.
 * @returns Minimum similarity value for this severity.
 */
export function getSeverityThreshold(severity: Severity): number {
  const thresholds: Record<Severity, number> = {
    [Severity.Critical]: 0.95,
    [Severity.Major]: 0.85,
    [Severity.Minor]: 0.5,
    [Severity.Info]: 0,
  };
  return thresholds[severity] || 0;
}

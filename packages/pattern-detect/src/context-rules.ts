import { Severity } from '@aiready/core';

/**
 * Context-aware severity detection for duplicate patterns
 * Identifies intentional duplication patterns and adjusts severity accordingly
 */

export interface ContextRule {
  name: string;
  detect: (file: string, code: string) => boolean;
  severity: Severity;
  reason: string;
  suggestion?: string;
}

/**
 * Context rules for detecting intentional or acceptable duplication patterns
 * Rules are checked in order - first match wins
 */
export const CONTEXT_RULES: ContextRule[] = [
  // Test Fixtures - Intentional duplication for test isolation
  {
    name: 'test-fixtures',
    detect: (file, code) => {
      const isTestFile =
        file.includes('.test.') ||
        file.includes('.spec.') ||
        file.includes('__tests__') ||
        file.includes('/test/') ||
        file.includes('/tests/');

      const hasTestFixtures =
        code.includes('beforeAll') ||
        code.includes('afterAll') ||
        code.includes('beforeEach') ||
        code.includes('afterEach') ||
        code.includes('setUp') ||
        code.includes('tearDown');

      return isTestFile && hasTestFixtures;
    },
    severity: Severity.Info,
    reason: 'Test fixture duplication is intentional for test isolation',
    suggestion:
      'Consider if shared test setup would improve maintainability without coupling tests',
  },

  // Email/Document Templates - Often intentionally similar for consistency
  {
    name: 'templates',
    detect: (file, code) => {
      const isTemplate =
        file.includes('/templates/') ||
        file.includes('-template') ||
        file.includes('/email-templates/') ||
        file.includes('/emails/');

      const hasTemplateContent =
        (code.includes('return') || code.includes('export')) &&
        (code.includes('html') ||
          code.includes('subject') ||
          code.includes('body'));

      return isTemplate && hasTemplateContent;
    },
    severity: Severity.Minor,
    reason:
      'Template duplication may be intentional for maintainability and branding consistency',
    suggestion:
      'Extract shared structure only if templates become hard to maintain',
  },

  // E2E/Integration Test Page Objects - Test independence
  {
    name: 'e2e-page-objects',
    detect: (file, code) => {
      const isE2ETest =
        file.includes('e2e/') ||
        file.includes('/e2e/') ||
        file.includes('.e2e.') ||
        file.includes('/playwright/') ||
        file.includes('playwright/') ||
        file.includes('/cypress/') ||
        file.includes('cypress/') ||
        file.includes('/integration/') ||
        file.includes('integration/');

      const hasPageObjectPatterns =
        code.includes('page.') ||
        code.includes('await page') ||
        code.includes('locator') ||
        code.includes('getBy') ||
        code.includes('selector') ||
        code.includes('click(') ||
        code.includes('fill(');

      return isE2ETest && hasPageObjectPatterns;
    },
    severity: Severity.Minor,
    reason:
      'E2E test duplication ensures test independence and reduces coupling',
    suggestion:
      'Consider page object pattern only if duplication causes maintenance issues',
  },

  // Configuration Files - Often necessarily similar by design
  {
    name: 'config-files',
    detect: (file) => {
      return (
        file.endsWith('.config.ts') ||
        file.endsWith('.config.js') ||
        file.includes('jest.config') ||
        file.includes('vite.config') ||
        file.includes('webpack.config') ||
        file.includes('rollup.config') ||
        file.includes('tsconfig')
      );
    },
    severity: Severity.Minor,
    reason: 'Configuration files often have similar structure by design',
    suggestion:
      'Consider shared config base only if configurations become hard to maintain',
  },

  // Type Definitions - Duplication for type safety and module independence
  {
    name: 'type-definitions',
    detect: (file, code) => {
      const isTypeFile = file.endsWith('.d.ts') || file.includes('/types/');

      const hasTypeDefinitions =
        code.includes('interface ') ||
        code.includes('type ') ||
        code.includes('enum ');

      return isTypeFile && hasTypeDefinitions;
    },
    severity: Severity.Info,
    reason:
      'Type duplication may be intentional for module independence and type safety',
    suggestion:
      'Extract to shared types package only if causing maintenance burden',
  },

  // Migration Scripts - One-off scripts that are similar by nature
  {
    name: 'migration-scripts',
    detect: (file) => {
      return (
        file.includes('/migrations/') ||
        file.includes('/migrate/') ||
        file.includes('.migration.')
      );
    },
    severity: Severity.Info,
    reason: 'Migration scripts are typically one-off and intentionally similar',
    suggestion: 'Duplication is acceptable for migration scripts',
  },

  // Mock Data - Test data intentionally duplicated
  {
    name: 'mock-data',
    detect: (file, code) => {
      const isMockFile =
        file.includes('/mocks/') ||
        file.includes('/__mocks__/') ||
        file.includes('/fixtures/') ||
        file.includes('.mock.') ||
        file.includes('.fixture.');

      const hasMockData =
        code.includes('mock') ||
        code.includes('Mock') ||
        code.includes('fixture') ||
        code.includes('stub') ||
        code.includes('export const');

      return isMockFile && hasMockData;
    },
    severity: Severity.Info,
    reason: 'Mock data duplication is expected for comprehensive test coverage',
    suggestion: 'Consider shared factories only for complex mock generation',
  },

  // Tool Implementations - Structural Boilerplate
  {
    name: 'tool-implementations',
    detect: (file, code) => {
      const isToolFile =
        file.includes('/tools/') ||
        file.endsWith('.tool.ts') ||
        code.includes('toolDefinitions');

      const hasToolStructure =
        code.includes('execute') &&
        (code.includes('try') || code.includes('catch'));

      return isToolFile && hasToolStructure;
    },
    severity: Severity.Info,
    reason:
      'Tool implementations share structural boilerplate but have distinct business logic',
    suggestion:
      'Tool duplication is acceptable for boilerplate interface wrappers',
  },
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
  } else if (similarity >= 0.85) {
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
 * Get a human-readable severity label with emoji
 *
 * @param severity - The severity level to label.
 * @returns Formatted label string for UI display.
 */
export function getSeverityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    [Severity.Critical]: '🔴 CRITICAL',
    [Severity.Major]: '🟡 MAJOR',
    [Severity.Minor]: '🔵 MINOR',
    [Severity.Info]: 'ℹ️  INFO',
  };
  return labels[severity];
}

/**
 * Filter duplicates by minimum severity threshold
 *
 * @param duplicates - List of items with a severity property.
 * @param minSeverity - Minimum threshold for inclusion.
 * @returns Filtered list of items.
 */
export function filterBySeverity<T extends { severity: Severity }>(
  duplicates: T[],
  minSeverity: Severity
): T[] {
  const severityOrder: Severity[] = [
    Severity.Info,
    Severity.Minor,
    Severity.Major,
    Severity.Critical,
  ];
  const minIndex = severityOrder.indexOf(minSeverity);

  if (minIndex === -1) return duplicates;

  return duplicates.filter((dup) => {
    const dupIndex = severityOrder.indexOf(dup.severity);
    return dupIndex >= minIndex;
  });
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

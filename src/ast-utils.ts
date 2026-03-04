import { parseFileExports } from '@aiready/core';
import type { ExportInfo, DependencyNode, FileClassification } from './types';
import { inferDomain, extractExports } from './semantic-analysis';

/**
 * Extract exports using AST parsing with fallback to regex
 */
export function extractExportsWithAST(
  content: string,
  filePath: string,
  domainOptions?: { domainKeywords?: string[] },
  fileImports?: string[]
): ExportInfo[] {
  try {
    const { exports: astExports } = parseFileExports(content, filePath);

    return astExports.map((exp) => ({
      name: exp.name,
      type: exp.type as any,
      inferredDomain: inferDomain(
        exp.name,
        filePath,
        domainOptions,
        fileImports
      ),
      imports: exp.imports,
      dependencies: exp.dependencies,
      typeReferences: (exp as any).typeReferences,
    }));
  } catch (error) {
    void error;
    // Fallback to regex-based extraction
    return extractExports(content, filePath, domainOptions, fileImports);
  }
}

/**
 * Check if a file is a test, mock, or fixture file
 */
export function isTestFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return (
    lower.includes('.test.') ||
    lower.includes('.spec.') ||
    lower.includes('/__tests__/') ||
    lower.includes('/tests/') ||
    lower.includes('/test/') ||
    lower.includes('test-') ||
    lower.includes('-test') ||
    lower.includes('/__mocks__/') ||
    lower.includes('/mocks/') ||
    lower.includes('/fixtures/') ||
    lower.includes('.mock.') ||
    lower.includes('.fixture.') ||
    lower.includes('/test-utils/')
  );
}

/**
 * Heuristic to check if all exports share a common entity noun
 */
export function allExportsShareEntityNoun(exports: ExportInfo[]): boolean {
  if (exports.length < 2) return true;

  const getEntityNoun = (name: string): string | null => {
    // Basic heuristic: last part of camelCase name often is the entity
    // e.g. createOrder -> order, getUserProfile -> profile
    // But we also look for common domain nouns in the middle
    const commonNouns = [
      'user',
      'order',
      'product',
      'session',
      'account',
      'receipt',
      'token',
    ];
    const lower = name.toLowerCase();

    for (const noun of commonNouns) {
      if (lower.includes(noun)) return noun;
    }

    // Fallback: split by capital letters and take the last part
    const parts = name.split(/(?=[A-Z])/);
    return parts[parts.length - 1].toLowerCase();
  };

  const nouns = exports.map((e) => getEntityNoun(e.name)).filter(Boolean);
  if (nouns.length < exports.length * 0.7) return false;

  const firstNoun = nouns[0];
  return nouns.every((n) => n === firstNoun);
}

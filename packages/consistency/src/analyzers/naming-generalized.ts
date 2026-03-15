/**
 * Generalized Naming Analyzer
 *
 * Uses the @aiready/core LanguageParser infrastructure to validate
 * naming conventions across all supported languages.
 */

import { getParser, Severity, IssueType } from '@aiready/core';
import type { NamingIssue } from '../types';
import { readFileSync } from 'fs';

/**
 * Analyzes naming conventions using generalized LanguageParser metadata
 */
export async function analyzeNamingGeneralized(
  files: string[]
): Promise<NamingIssue[]> {
  const issues: NamingIssue[] = [];

  for (const file of files) {
    const parser = getParser(file);
    if (!parser) continue;

    try {
      const code = readFileSync(file, 'utf-8');
      // Ensure parser is initialized (e.g. WASM loaded)
      await parser.initialize();
      const result = parser.parse(code, file);
      const conventions = parser.getNamingConventions();

      // 1. Check Exports
      for (const exp of result.exports) {
        let pattern: RegExp | undefined;
        const typeName = exp.type;

        if (exp.type === 'class') {
          pattern = conventions.classPattern;
        } else if (exp.type === 'interface' && conventions.interfacePattern) {
          pattern = conventions.interfacePattern;
        } else if (exp.type === 'type' && conventions.typePattern) {
          pattern = conventions.typePattern;
        } else if (exp.type === 'function') {
          pattern = conventions.functionPattern;
        } else if (exp.type === 'const') {
          pattern = conventions.constantPattern;
        } else {
          pattern = conventions.variablePattern;
        }

        if (pattern && !pattern.test(exp.name)) {
          issues.push({
            type: 'naming-inconsistency',
            identifier: exp.name,
            file,
            line: exp.loc?.start.line || 1,
            column: exp.loc?.start.column || 0,
            severity: Severity.Major,
            category: 'naming',
            suggestion: `Follow ${parser.language} ${exp.type} naming convention: ${pattern.toString()}`,
          });
        }
      }

      // 2. Check Imports (basic check for specifier consistency)
      for (const imp of result.imports) {
        for (const spec of imp.specifiers) {
          if (spec === '*' || spec === 'default') continue;

          if (
            !conventions.variablePattern.test(spec) &&
            !conventions.classPattern.test(spec)
          ) {
            // This is often a 'convention-mix' issue (e.g. importing snake_case into camelCase project)
            issues.push({
              type: 'naming-inconsistency',
              identifier: spec,
              file,
              line: imp.loc?.start.line || 1,
              column: imp.loc?.start.column || 0,
              severity: Severity.Minor,
              category: 'naming',
              suggestion: `Imported identifier '${spec}' may not follow standard conventions for this language.`,
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Consistency: Failed to analyze ${file}: ${error}`);
    }
  }

  return issues;
}

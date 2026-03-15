import { readFileSync } from 'fs';
import { Severity } from '@aiready/core';
import type { PatternIssue } from '../types';

/**
 * Detect inconsistent code patterns across files
 */
export async function analyzePatterns(
  filePaths: string[]
): Promise<PatternIssue[]> {
  const issues: PatternIssue[] = [];
  const contents = new Map<string, string>();

  // 1. Error handling style
  const tryCatchPattern = /try\s*\{/g;
  const catchPattern = /catch\s*\(\s*(\w+)\s*\)/g;

  const styleStats = {
    tryCatch: 0,
    thenCatch: 0,
    asyncAwait: 0,
    commonJs: 0,
    esm: 0,
  };

  for (const filePath of filePaths) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      contents.set(filePath, content);

      if (content.match(tryCatchPattern)) styleStats.tryCatch++;
      if (content.match(/\.catch\s*\(/)) styleStats.thenCatch++;
      if (content.match(/\bawait\b/)) styleStats.asyncAwait++;

      if (content.match(/\brequire\s*\(/)) styleStats.commonJs++;
      if (content.match(/\bimport\b.*\bfrom\b/)) styleStats.esm++;
    } catch (err) {
      void err;
    }
  }

  const totalFiles = filePaths.length;

  // Report inconsistencies if there's a significant mix
  if (styleStats.tryCatch > 0 && styleStats.thenCatch > 0) {
    const dominant =
      styleStats.tryCatch >= styleStats.thenCatch ? 'try-catch' : '.catch()';
    const minority = dominant === 'try-catch' ? '.catch()' : 'try-catch';

    issues.push({
      files: filePaths.filter((f) => {
        const c = contents.get(f) || '';
        return minority === 'try-catch'
          ? c.match(tryCatchPattern)
          : c.match(/\.catch\s*\(/);
      }),
      type: 'pattern-inconsistency',
      description: `Mixed error handling styles: codebase primarily uses ${dominant}, but found ${minority} in some files.`,
      examples: [dominant, minority],
      severity: Severity.Minor,
    });
  }

  if (styleStats.commonJs > 0 && styleStats.esm > 0) {
    const minority =
      styleStats.esm >= styleStats.commonJs
        ? 'CommonJS (require)'
        : 'ESM (import)';
    issues.push({
      files: filePaths.filter((f) => {
        const c = contents.get(f) || '';
        return minority === 'CommonJS (require)'
          ? c.match(/\brequire\s*\(/)
          : c.match(/\bimport\b/);
      }),
      type: 'pattern-inconsistency',
      description: `Mixed module systems: found both ESM and CommonJS.`,
      examples: ['import X from "y"', 'const X = require("y")'],
      severity: Severity.Major,
    });
  }

  return issues;
}

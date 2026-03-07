import {
  scanFiles,
  Severity,
  IssueType,
  GLOBAL_SCAN_OPTIONS,
} from '@aiready/core';
import type { AnalysisResult, Issue } from '@aiready/core';
import type {
  ConsistencyOptions,
  ConsistencyReport,
  ConsistencyIssue,
} from './types';
import { analyzeNamingAST } from './analyzers/naming-ast';
import { analyzePythonNaming } from './analyzers/naming-python';
import { analyzePatterns } from './analyzers/patterns';

/**
 * Main consistency analyzer that orchestrates all analysis types
 * Supports: TypeScript, JavaScript, Python
 */
export async function analyzeConsistency(
  options: ConsistencyOptions
): Promise<ConsistencyReport> {
  const {
    checkNaming = true,
    checkPatterns = true,
    checkArchitecture = false, // Not implemented yet
    minSeverity = Severity.Info,
    ...scanOptions
  } = options;

  // Mark intentionally-unused option to avoid lint warnings
  void checkArchitecture;

  // Scan files
  const filePaths = await scanFiles(scanOptions);

  // Separate files by language
  const tsJsFiles = filePaths.filter((f) => /\.(ts|tsx|js|jsx)$/i.test(f));
  const pythonFiles = filePaths.filter((f) => /\.py$/i.test(f));

  // Collect issues by category - now handles multiple languages
  let namingIssues: any[] = [];
  if (checkNaming) {
    const tsJsNamingIssues =
      tsJsFiles.length > 0 ? await analyzeNamingAST(tsJsFiles) : [];
    const pythonNamingIssues =
      pythonFiles.length > 0 ? await analyzePythonNaming(pythonFiles) : [];
    namingIssues = [...tsJsNamingIssues, ...pythonNamingIssues];
  }

  const patternIssues = checkPatterns ? await analyzePatterns(filePaths) : [];

  // Convert to AnalysisResult format
  const results: AnalysisResult[] = [];
  const fileIssuesMap = new Map<string, ConsistencyIssue[]>();

  // Process naming issues
  for (const issue of namingIssues) {
    if (!shouldIncludeSeverity(issue.severity, minSeverity)) {
      continue;
    }

    const consistencyIssue: ConsistencyIssue = {
      type:
        issue.type === 'convention-mix'
          ? IssueType.NamingInconsistency
          : IssueType.NamingQuality,
      category: 'naming',
      severity: getSeverityEnum(issue.severity),
      message: `${issue.type}: ${issue.identifier}`,
      location: {
        file: issue.file,
        line: issue.line,
        column: issue.column,
      },
      suggestion: issue.suggestion,
    };

    if (!fileIssuesMap.has(issue.file)) {
      fileIssuesMap.set(issue.file, []);
    }
    fileIssuesMap.get(issue.file)!.push(consistencyIssue);
  }

  // Process pattern issues
  for (const issue of patternIssues) {
    if (!shouldIncludeSeverity(issue.severity, minSeverity)) {
      continue;
    }

    const consistencyIssue: ConsistencyIssue = {
      type: IssueType.PatternInconsistency,
      category: 'patterns',
      severity: getSeverityEnum(issue.severity),
      message: issue.description,
      location: {
        file: issue.files[0] || 'multiple files',
        line: 1,
      },
      examples: issue.examples,
      suggestion: `Standardize ${issue.type} patterns across ${issue.files.length} files`,
    };

    // Add to first file in the pattern
    const firstFile = issue.files[0];
    if (firstFile && !fileIssuesMap.has(firstFile)) {
      fileIssuesMap.set(firstFile, []);
    }
    if (firstFile) {
      fileIssuesMap.get(firstFile)!.push(consistencyIssue);
    }
  }

  // Convert to AnalysisResult format
  for (const [fileName, issues] of fileIssuesMap) {
    results.push({
      fileName,
      issues: issues as Issue[],
      metrics: {
        consistencyScore: calculateConsistencyScore(issues),
      },
    });
  }

  // Sort results by severity first, then by issue count per file
  results.sort((fileResultA, fileResultB) => {
    // Get highest severity in each file
    const maxSeverityA = Math.min(
      ...fileResultA.issues.map((i) => {
        const val = getSeverityLevel((i as ConsistencyIssue).severity);
        // Map 4->0, 3->1, 2->2, 1->3
        return val === 4 ? 0 : val === 3 ? 1 : val === 2 ? 2 : 3;
      })
    );
    const maxSeverityB = Math.min(
      ...fileResultB.issues.map((i) => {
        const val = getSeverityLevel((i as ConsistencyIssue).severity);
        return val === 4 ? 0 : val === 3 ? 1 : val === 2 ? 2 : 3;
      })
    );

    // Sort by severity first
    if (maxSeverityA !== maxSeverityB) {
      return maxSeverityA - maxSeverityB;
    }

    // Then by issue count (descending)
    return fileResultB.issues.length - fileResultA.issues.length;
  });

  // Generate recommendations
  const recommendations = generateRecommendations(namingIssues, patternIssues);

  // Compute filtered counts (respecting minSeverity) to report accurate summary
  const namingCountFiltered = namingIssues.filter((i) =>
    shouldIncludeSeverity(i.severity, minSeverity)
  ).length;
  const patternCountFiltered = patternIssues.filter((i) =>
    shouldIncludeSeverity(i.severity, minSeverity)
  ).length;

  return {
    summary: {
      totalIssues: namingCountFiltered + patternCountFiltered,
      namingIssues: namingCountFiltered,
      patternIssues: patternCountFiltered,
      architectureIssues: 0,
      filesAnalyzed: filePaths.length,
      config: Object.fromEntries(
        Object.entries(options).filter(
          ([key]) => !GLOBAL_SCAN_OPTIONS.includes(key) || key === 'rootDir'
        )
      ),
    },
    results,
    recommendations,
  };
}

function getSeverityLevel(s: any): number {
  if (s === Severity.Critical || s === 'critical') return 4;
  if (s === Severity.Major || s === 'major') return 3;
  if (s === Severity.Minor || s === 'minor') return 2;
  if (s === Severity.Info || s === 'info') return 1;
  return 0;
}

function getSeverityEnum(s: any): Severity {
  const val = getSeverityLevel(s);
  switch (val) {
    case 4:
      return Severity.Critical;
    case 3:
      return Severity.Major;
    case 2:
      return Severity.Minor;
    case 1:
      return Severity.Info;
    default:
      return Severity.Info;
  }
}

function shouldIncludeSeverity(
  severity: Severity | string,
  minSeverity: Severity | string
): boolean {
  return getSeverityLevel(severity) >= getSeverityLevel(minSeverity);
}

function calculateConsistencyScore(issues: ConsistencyIssue[]): number {
  let totalWeight = 0;
  for (const issue of issues) {
    const val = getSeverityLevel(issue.severity);
    switch (val) {
      case 4:
        totalWeight += 10;
        break;
      case 3:
        totalWeight += 5;
        break;
      case 2:
        totalWeight += 2;
        break;
      case 1:
        totalWeight += 1;
        break;
      default:
        totalWeight += 1;
    }
  }
  // Score from 0-1, where 1 is perfect
  return Math.max(0, 1 - totalWeight / 100);
}

function generateRecommendations(
  namingIssues: any[],
  patternIssues: any[]
): string[] {
  const recommendations: string[] = [];

  if (namingIssues.length > 0) {
    const conventionMixCount = namingIssues.filter(
      (i) => i.type === 'convention-mix'
    ).length;
    if (conventionMixCount > 0) {
      recommendations.push(
        `Standardize naming conventions: Found ${conventionMixCount} snake_case variables in TypeScript/JavaScript (use camelCase)`
      );
    }

    const poorNamingCount = namingIssues.filter(
      (i) => i.type === 'poor-naming'
    ).length;
    if (poorNamingCount > 0) {
      recommendations.push(
        `Improve variable naming: Found ${poorNamingCount} single-letter or unclear variable names`
      );
    }
  }

  if (patternIssues.length > 0) {
    const errorHandlingIssues = patternIssues.filter(
      (i) => i.type === 'error-handling'
    );
    if (errorHandlingIssues.length > 0) {
      recommendations.push(
        'Standardize error handling strategy across the codebase (prefer try-catch with typed errors)'
      );
    }

    const asyncIssues = patternIssues.filter((i) => i.type === 'async-style');
    if (asyncIssues.length > 0) {
      recommendations.push(
        'Use async/await consistently instead of mixing with promise chains or callbacks'
      );
    }

    const importIssues = patternIssues.filter((i) => i.type === 'import-style');
    if (importIssues.length > 0) {
      recommendations.push(
        'Use ES modules consistently across the project (avoid mixing with CommonJS)'
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'No major consistency issues found! Your codebase follows good practices.'
    );
  }

  return recommendations;
}

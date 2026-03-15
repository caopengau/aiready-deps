import {
  scanFiles,
  Severity,
  IssueType,
  GLOBAL_SCAN_OPTIONS,
  getSeverityLevel,
} from '@aiready/core';
import type { AnalysisResult, Issue } from '@aiready/core';
import type {
  ConsistencyOptions,
  ConsistencyReport,
  ConsistencyIssue,
} from './types';
import { analyzeNamingAST } from './analyzers/naming-ast';
import { analyzeNamingGeneralized } from './analyzers/naming-generalized';
import { analyzePatterns } from './analyzers/patterns';

/**
 * Main consistency analyzer that orchestrates all analysis types
 * Supports: TypeScript, JavaScript, Python, Java, C#, Go
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

  // Collect issues by category
  let namingIssues: any[] = [];
  if (checkNaming) {
    // 1. Generalized naming analysis for all supported files
    namingIssues = await analyzeNamingGeneralized(filePaths);

    // 2. Targeted deep AST analysis for TS/JS (handled by specialized analyzer)
    const tsJsFiles = filePaths.filter((f) => /\.(ts|tsx|js|jsx)$/i.test(f));
    if (tsJsFiles.length > 0) {
      const deepTsIssues = await analyzeNamingAST(tsJsFiles);
      // Merge issues, avoiding duplicates for exports if already checked
      namingIssues = [...namingIssues, ...deepTsIssues];
    }
  }

  const patternIssues = checkPatterns ? await analyzePatterns(filePaths) : [];

  // Convert to AnalysisResult format
  const results: AnalysisResult[] = [];
  const fileIssuesMap = new Map<string, ConsistencyIssue[]>();

  // Process naming issues
  for (const issue of namingIssues) {
    if (!shouldIncludeSeverity(issue.severity, minSeverity)) continue;

    const fileName =
      (issue as any).fileName ||
      (issue as any).file ||
      (issue as any).filePath ||
      'unknown';
    if (!fileIssuesMap.has(fileName)) fileIssuesMap.set(fileName, []);
    fileIssuesMap.get(fileName)!.push(issue as unknown as ConsistencyIssue);
  }

  // Process pattern issues
  for (const issue of patternIssues) {
    if (!shouldIncludeSeverity(issue.severity, minSeverity)) continue;

    const fileName =
      (issue as any).fileName ||
      (issue as any).file ||
      (issue as any).filePath ||
      (Array.isArray((issue as any).files)
        ? (issue as any).files[0]
        : 'unknown');
    if (!fileIssuesMap.has(fileName)) fileIssuesMap.set(fileName, []);
    fileIssuesMap.get(fileName)!.push(issue as unknown as ConsistencyIssue);
  }

  // Build final results
  for (const [fileName, issues] of fileIssuesMap.entries()) {
    results.push({
      fileName,
      issues: issues.map((i) => transformToIssue(i)),
      metrics: {
        consistencyScore: calculateConsistencyScore(issues),
      },
    });
  }

  return {
    results,
    summary: {
      filesAnalyzed: filePaths.length,
      totalIssues: results.reduce((acc, r) => acc + r.issues.length, 0),
      namingIssues: namingIssues.length,
      patternIssues: patternIssues.length,
      architectureIssues: 0,
    },
    recommendations: [],
    metadata: {
      toolName: 'naming-consistency',
      timestamp: new Date().toISOString(),
    },
  } as unknown as ConsistencyReport;
}

function shouldIncludeSeverity(
  severity: Severity | string,
  minSeverity: Severity | string
): boolean {
  return getSeverityLevel(severity) >= getSeverityLevel(minSeverity);
}

/**
 * Map string type to IssueType enum value
 */
function getIssueType(type: string | undefined): IssueType {
  if (!type) return IssueType.NamingInconsistency;

  // Map string values to enum
  const typeMap: Record<string, IssueType> = {
    'naming-inconsistency': IssueType.NamingInconsistency,
    'naming-quality': IssueType.NamingQuality,
    'pattern-inconsistency': IssueType.PatternInconsistency,
    'architecture-inconsistency': IssueType.ArchitectureInconsistency,
    'error-handling': IssueType.PatternInconsistency,
    'async-style': IssueType.PatternInconsistency,
    'import-style': IssueType.PatternInconsistency,
    'api-design': IssueType.PatternInconsistency,
  };

  return typeMap[type] || IssueType.NamingInconsistency;
}

/**
 * Transform NamingIssue or PatternIssue to the required Issue format
 */
function transformToIssue(i: any): Issue {
  // If already has message and location, return as is
  if (i.message && i.location) {
    return {
      type: getIssueType(i.type),
      severity: i.severity as Severity,
      message: i.message,
      location: i.location,
      suggestion: i.suggestion,
    };
  }

  // Handle NamingIssue format (has file, line, column, identifier, suggestion)
  if (i.identifier || i.type) {
    const line = i.line || 1;
    const column = i.column || 1;
    return {
      type: getIssueType(i.type),
      severity: i.severity as Severity,
      message: i.suggestion
        ? `Naming issue: ${i.suggestion}`
        : `Naming issue for '${i.identifier || 'unknown'}'`,
      location: {
        file: i.file || i.fileName || '',
        line,
        column,
        endLine: line,
        endColumn: column + (i.identifier?.length || 10),
      },
      suggestion: i.suggestion,
    };
  }

  // Handle PatternIssue format (has description, files)
  if (i.description || i.files) {
    const fileName = Array.isArray(i.files) ? i.files[0] : i.file || '';
    return {
      type: getIssueType(i.type),
      severity: i.severity as Severity,
      message: i.description || 'Pattern inconsistency found',
      location: {
        file: fileName,
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 10,
      },
      suggestion: i.examples?.[0],
    };
  }

  // Fallback
  return {
    type: getIssueType(i.type),
    severity: i.severity as Severity,
    message: i.message || 'Unknown issue',
    location: i.location || { file: '', line: 1, column: 1 },
    suggestion: i.suggestion,
  };
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

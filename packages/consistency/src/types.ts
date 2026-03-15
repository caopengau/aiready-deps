import type {
  ScanOptions,
  AnalysisResult,
  Issue,
  Severity,
  IssueType,
} from '@aiready/core';

export interface ConsistencyOptions extends ScanOptions {
  /** Check naming conventions and quality */
  checkNaming?: boolean;
  /** Check code pattern consistency */
  checkPatterns?: boolean;
  /** Check architectural consistency */
  checkArchitecture?: boolean;
  /** Minimum severity to report */
  minSeverity?: Severity;
}

export interface ConsistencyIssue extends Issue {
  type:
    | IssueType.NamingInconsistency
    | IssueType.NamingQuality
    | IssueType.PatternInconsistency
    | IssueType.ArchitectureInconsistency;
  category: 'naming' | 'patterns' | 'architecture';
  /** Examples of the inconsistency found */
  examples?: string[];
  /** Suggested fix or convention to follow */
  suggestion?: string;
}

export interface NamingIssue {
  file: string;
  line: number;
  column?: number;
  type: string;
  identifier: string;
  suggestion?: string;
  severity: Severity;
  category?: 'naming';
}

export interface PatternIssue {
  files: string[];
  type:
    | 'error-handling'
    | 'async-style'
    | 'import-style'
    | 'api-design'
    | 'pattern-inconsistency';
  description: string;
  examples: string[];
  severity: Severity;
}

export interface ArchitectureIssue {
  type: 'file-organization' | 'module-structure' | 'export-style';
  description: string;
  affectedPaths: string[];
  severity: Severity;
}

export interface ConsistencyReport {
  summary: {
    totalIssues: number;
    namingIssues: number;
    patternIssues: number;
    architectureIssues: number;
    filesAnalyzed: number;
    config?: any;
  };
  results: AnalysisResult[];
  recommendations: string[];
}

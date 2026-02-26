import type { ScanOptions, Issue } from '@aiready/core';

export interface DepsOptions extends ScanOptions {
  /** The year the AI model was trained. Defaults to 2023. */
  trainingCutoffYear?: number;
}

export interface DepsIssue extends Issue {
  type: 'dependency-health';
}

export interface DepsReport {
  summary: {
    filesAnalyzed: number; // Basically package.json files
    packagesAnalyzed: number;
    score: number;
    rating: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
  };
  issues: DepsIssue[];
  rawData: {
    totalPackages: number;
    outdatedPackages: number;
    deprecatedPackages: number;
    trainingCutoffSkew: number;
  };
  recommendations: string[];
}

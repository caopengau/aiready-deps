import { describe, it, expect } from 'vitest';
import { calculateDepsScore } from '../scoring';
import { DepsReport } from '../types';
import { ToolName } from '@aiready/core';

describe('Dependency Health Scoring', () => {
  const mockReport: DepsReport = {
    summary: {
      filesAnalyzed: 2,
      packagesAnalyzed: 20,
      score: 85,
      rating: 'excellent',
    },
    issues: [],
    rawData: {
      totalPackages: 100,
      outdatedPackages: 10,
      deprecatedPackages: 2,
      trainingCutoffSkew: 0.1,
    },
    recommendations: ['Replace 2 deprecated packages.'],
  };

  it('should map report to ToolScoringOutput correctly', () => {
    const scoring = calculateDepsScore(mockReport);

    expect(scoring.toolName).toBe(ToolName.DependencyHealth);
    expect(scoring.score).toBe(85);
    expect(scoring.factors.length).toBeGreaterThan(0);
    expect(scoring.recommendations[0].action).toBe(
      'Replace 2 deprecated packages.'
    );
  });

  it('should set high priority for low scores', () => {
    const lowScoreReport: DepsReport = {
      ...mockReport,
      summary: {
        ...mockReport.summary,
        score: 30,
      },
    };

    const scoring = calculateDepsScore(lowScoreReport);
    expect(scoring.recommendations[0].priority).toBe('high');
  });
});

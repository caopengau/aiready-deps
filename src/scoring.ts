import { calculateDependencyHealth, ToolName } from '@aiready/core';
import type { ToolScoringOutput } from '@aiready/core';
import type { DepsReport } from './types';

/**
 * Convert dependency health report into a ToolScoringOutput.
 */
export function calculateDepsScore(report: DepsReport): ToolScoringOutput {
  const { rawData, summary } = report;

  // Recalculate using core math to get risk contribution breakdown
  const riskResult = calculateDependencyHealth({
    totalPackages: rawData.totalPackages,
    outdatedPackages: rawData.outdatedPackages,
    deprecatedPackages: rawData.deprecatedPackages,
    trainingCutoffSkew: rawData.trainingCutoffSkew,
  });

  const factors: ToolScoringOutput['factors'] = [
    {
      name: 'Outdated Packages',
      impact: -Math.min(
        30,
        (rawData.outdatedPackages / Math.max(1, rawData.totalPackages)) *
          100 *
          0.3
      ),
      description: `${rawData.outdatedPackages} outdated packages`,
    },
    {
      name: 'Deprecated Packages',
      impact: -Math.min(
        40,
        (rawData.deprecatedPackages / Math.max(1, rawData.totalPackages)) *
          100 *
          0.4
      ),
      description: `${rawData.deprecatedPackages} deprecated packages`,
    },
    {
      name: 'Training Cutoff Skew',
      impact: -Math.min(30, rawData.trainingCutoffSkew * 100 * 0.3),
      description: `Training cutoff skew of ${rawData.trainingCutoffSkew.toFixed(1)} years`,
    },
  ];

  const recommendations: ToolScoringOutput['recommendations'] =
    riskResult.recommendations.map((rec) => ({
      action: rec,
      estimatedImpact: 6,
      priority: summary.score < 50 ? 'high' : 'medium',
    }));

  return {
    toolName: ToolName.DependencyHealth,
    score: summary.score,
    rawMetrics: {
      ...rawData,
      rating: summary.rating,
    },
    factors,
    recommendations,
  };
}

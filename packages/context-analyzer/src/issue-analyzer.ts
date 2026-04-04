import { Severity, isBuildArtifact } from '@aiready/core';

// Re-export for testing
export { isBuildArtifact };

/**
 * Internal issue analysis logic
 */
/**
 * Analyzes architectural issues related to AI context windows.
 * Detects problems like high import depth, large context budgets,
 * circular dependencies, and low cohesion.
 *
 * @param params - Combined metrics and graph data for a module
 * @returns List of identified issues with severity and suggestions
 */
export function analyzeIssues(params: {
  file: string;
  importDepth: number;
  tokenCost: number;
  contextBudget: number;
  cohesionScore: number;
  fragmentationScore: number;
  maxDepth: number;
  maxContextBudget: number;
  minCohesion: number;
  maxFragmentation: number;
  circularDeps: string[][];
}): {
  severity: Severity;
  issues: string[];
  recommendations: string[];
  potentialSavings: number;
} {
  const {
    file,
    importDepth,
    tokenCost,
    contextBudget,
    cohesionScore,
    fragmentationScore,
    maxDepth,
    maxContextBudget,
    minCohesion,
    maxFragmentation,
    circularDeps,
  } = params;

  const issues: string[] = [];
  const recommendations: string[] = [];
  let severity: Severity = Severity.Info;
  let potentialSavings = 0;

  // Check circular dependencies (CRITICAL)
  if (circularDeps.length > 0) {
    severity = Severity.Critical;
    issues.push(`Part of ${circularDeps.length} circular dependency chain(s)`);
    recommendations.push(
      'Break circular dependencies by extracting interfaces or using dependency injection'
    );
    potentialSavings += contextBudget * 0.2;
  }

  // Check import depth
  if (importDepth > maxDepth * 1.5) {
    severity = Severity.Critical;
    issues.push(`Import depth ${importDepth} exceeds limit by 50%`);
    recommendations.push('Flatten dependency tree or use facade pattern');
    potentialSavings += contextBudget * 0.3;
  } else if (importDepth > maxDepth) {
    if (severity !== Severity.Critical) severity = Severity.Major;
    issues.push(
      `Import depth ${importDepth} exceeds recommended maximum ${maxDepth}`
    );
    recommendations.push('Consider reducing dependency depth');
    potentialSavings += contextBudget * 0.15;
  }

  // Check direct file size
  const MAX_FILE_TOKENS = 10000;
  if (tokenCost > MAX_FILE_TOKENS) {
    if (severity !== Severity.Critical) severity = Severity.Major;
    issues.push(
      `File is excessively large (${tokenCost.toLocaleString()} tokens)`
    );
    recommendations.push(
      'Split file into smaller, single-responsibility modules'
    );
  }

  // Check transitive context budget
  if (contextBudget > maxContextBudget * 1.5) {
    severity = Severity.Critical;
    issues.push(
      `Total context budget ${contextBudget.toLocaleString()} tokens is 50% over limit`
    );
    recommendations.push('Reduce dependency tree width or reduce deep imports');
    potentialSavings += contextBudget * 0.4;
  } else if (contextBudget > maxContextBudget) {
    if (severity !== Severity.Critical) severity = Severity.Major;
    issues.push(
      `Total context budget ${contextBudget.toLocaleString()} exceeds ${maxContextBudget.toLocaleString()}`
    );
    recommendations.push('Optimize dependency graph and reduce deep imports');
    potentialSavings += contextBudget * 0.2;
  }

  // Check cohesion
  if (cohesionScore < minCohesion * 0.5) {
    if (severity !== Severity.Critical) severity = Severity.Major;
    issues.push(
      `Very low cohesion (${(cohesionScore * 100).toFixed(0)}%) - mixed concerns`
    );
    recommendations.push(
      'Split file by domain - separate unrelated functionality'
    );
    potentialSavings += contextBudget * 0.25;
  } else if (cohesionScore < minCohesion) {
    if (severity === Severity.Info) severity = Severity.Minor;
    issues.push(`Low cohesion (${(cohesionScore * 100).toFixed(0)}%)`);
    recommendations.push('Consider grouping related exports together');
    potentialSavings += contextBudget * 0.1;
  }

  // Check fragmentation
  if (fragmentationScore > maxFragmentation) {
    if (severity === Severity.Info || severity === Severity.Minor)
      severity = Severity.Minor;
    issues.push(
      `High fragmentation (${(fragmentationScore * 100).toFixed(0)}%) - scattered implementation`
    );
    recommendations.push('Consolidate with related files in same domain');
    potentialSavings += contextBudget * 0.3;
  }

  // Don't create issues when there are no real problems
  // This prevents false positives that artificially lower scores

  // Detect build artifacts
  if (isBuildArtifact(file)) {
    issues.push('Detected build artifact (bundled/output file)');
    recommendations.push('Exclude build outputs from analysis');
    severity = Severity.Info;
    potentialSavings = 0;
  }

  return {
    severity,
    issues,
    recommendations,
    potentialSavings: Math.floor(potentialSavings),
  };
}

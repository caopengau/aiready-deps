import { Severity } from '@aiready/core';

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

  // Check context budget
  if (contextBudget > maxContextBudget * 1.5) {
    severity = Severity.Critical;
    issues.push(
      `Context budget ${contextBudget.toLocaleString()} tokens is 50% over limit`
    );
    recommendations.push(
      'Split into smaller modules or reduce dependency tree'
    );
    potentialSavings += contextBudget * 0.4;
  } else if (contextBudget > maxContextBudget) {
    if (severity !== Severity.Critical) severity = Severity.Major;
    issues.push(
      `Context budget ${contextBudget.toLocaleString()} exceeds ${maxContextBudget.toLocaleString()}`
    );
    recommendations.push('Reduce file size or dependencies');
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

  if (issues.length === 0) {
    issues.push('No significant issues detected');
    recommendations.push('File is well-structured for AI context usage');
  }

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

/**
 * Determines if a file path belongs to a build artifact or dependency folder.
 * Helps exclude generated files from analysis to prevent false positives.
 *
 * @param filePath - The path to check
 * @returns True if the file is a build artifact, false otherwise
 */
export function isBuildArtifact(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return (
    lower.includes('/node_modules/') ||
    lower.includes('/dist/') ||
    lower.includes('/build/') ||
    lower.includes('/out/') ||
    lower.includes('/.next/')
  );
}

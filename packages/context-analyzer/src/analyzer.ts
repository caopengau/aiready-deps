import { scanFiles, readFileContent } from '@aiready/core';
import type {
  ExportInfo,
  ContextAnalysisResult,
  ContextAnalyzerOptions,
  FileClassification,
} from './types';
import { calculateEnhancedCohesion } from './metrics';
import { analyzeIssues } from './issue-analyzer';

import {
  buildDependencyGraph,
  calculateImportDepth,
  getTransitiveDependencies,
  calculateContextBudget,
  detectCircularDependencies,
} from './graph-builder';
import { detectModuleClusters } from './cluster-detector';
import {
  classifyFile,
  adjustCohesionForClassification,
  adjustFragmentationForClassification,
} from './classifier';
import { getClassificationRecommendations } from './remediation';

/**
 * Calculate cohesion score (how related are exports in a file).
 * Legacy wrapper for backward compatibility with exact test expectations.
 *
 * @param exports - List of exported symbols
 * @param filePath - Path to the file being analyzed
 * @param options - Additional options for cohesion calculation
 * @returns Cohesion score between 0 and 1
 */
export function calculateCohesion(
  exports: ExportInfo[],
  filePath?: string,
  options?: any
): number {
  return calculateEnhancedCohesion(exports, filePath, options);
}

/**
 * Analyze AI context window cost for a codebase
 */
/**
 * Performs deep context analysis of a project.
 * Scans files, builds a dependency graph, calculates context budgets,
 * and identifies structural issues like high fragmentation or depth.
 *
 * @param options - Analysis parameters including root directory and focus areas
 * @returns Comprehensive analysis results with metrics and identified issues
 */
export async function analyzeContext(
  options: ContextAnalyzerOptions
): Promise<ContextAnalysisResult[]> {
  const {
    maxDepth = 5,
    maxContextBudget = 25000,
    minCohesion = 0.6,
    maxFragmentation = 0.5,
    includeNodeModules = false,
    ...scanOptions
  } = options;

  const files = await scanFiles({
    ...scanOptions,
    exclude:
      includeNodeModules && scanOptions.exclude
        ? scanOptions.exclude.filter(
            (pattern) => pattern !== '**/node_modules/**'
          )
        : scanOptions.exclude,
  });

  const pythonFiles = files.filter((f) => f.toLowerCase().endsWith('.py'));
  const fileContents = await Promise.all(
    files.map(async (file) => ({
      file,
      content: await readFileContent(file),
    }))
  );

  const graph = buildDependencyGraph(
    fileContents.filter((f) => !f.file.toLowerCase().endsWith('.py'))
  );

  let pythonResults: ContextAnalysisResult[] = [];
  if (pythonFiles.length > 0) {
    const { analyzePythonContext } = await import('./analyzers/python-context');
    const pythonMetrics = await analyzePythonContext(
      pythonFiles,
      scanOptions.rootDir || options.rootDir || '.'
    );

    pythonResults = pythonMetrics.map((metric) => {
      const { severity, issues, recommendations, potentialSavings } =
        analyzeIssues({
          file: metric.file,
          importDepth: metric.importDepth,
          contextBudget: metric.contextBudget,
          cohesionScore: metric.cohesion,
          fragmentationScore: 0,
          maxDepth,
          maxContextBudget,
          minCohesion,
          maxFragmentation,
          circularDeps: [],
        });

      return {
        file: metric.file,
        tokenCost: 0,
        linesOfCode: 0, // Not provided by python context yet
        importDepth: metric.importDepth,
        dependencyCount: 0, // Not provided
        dependencyList: [],
        circularDeps: [],
        cohesionScore: metric.cohesion,
        domains: [],
        exportCount: 0,
        contextBudget: metric.contextBudget,
        fragmentationScore: 0,
        relatedFiles: [],
        fileClassification: 'unknown' as FileClassification,
        severity,
        issues,
        recommendations,
        potentialSavings,
      };
    });
  }

  const clusters = detectModuleClusters(graph);
  const allCircularDeps = detectCircularDependencies(graph);

  const results: ContextAnalysisResult[] = Array.from(graph.nodes.values()).map(
    (node) => {
      const file = node.file;
      const tokenCost = node.tokenCost;
      const importDepth = calculateImportDepth(file, graph);
      const transitiveDeps = getTransitiveDependencies(file, graph);
      const contextBudget = calculateContextBudget(file, graph);
      const circularDeps = allCircularDeps.filter((cycle) =>
        cycle.includes(file)
      );

      // Find cluster for this file
      const cluster = clusters.find((c) => c.files.includes(file));
      const rawFragmentationScore = cluster ? cluster.fragmentationScore : 0;

      // Cohesion
      const rawCohesionScore = calculateEnhancedCohesion(
        node.exports,
        file,
        options as any
      );

      // Initial classification
      const fileClassification = classifyFile(node, rawCohesionScore);

      // Adjust scores based on classification
      const cohesionScore = adjustCohesionForClassification(
        rawCohesionScore,
        fileClassification
      );
      const fragmentationScore = adjustFragmentationForClassification(
        rawFragmentationScore,
        fileClassification
      );

      const { severity, issues, recommendations, potentialSavings } =
        analyzeIssues({
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
        });

      // Add classification-specific recommendations
      const classRecs = getClassificationRecommendations(
        fileClassification,
        file,
        issues
      );
      const allRecommendations = Array.from(
        new Set([...recommendations, ...classRecs])
      );

      return {
        file,
        tokenCost,
        linesOfCode: node.linesOfCode,
        importDepth,
        dependencyCount: transitiveDeps.length,
        dependencyList: transitiveDeps,
        circularDeps,
        cohesionScore,
        domains: Array.from(
          new Set(
            node.exports.flatMap((e) => e.domains?.map((d) => d.domain) || [])
          )
        ),
        exportCount: node.exports.length,
        contextBudget,
        fragmentationScore,
        relatedFiles: cluster ? cluster.files : [],
        fileClassification,
        severity,
        issues,
        recommendations: allRecommendations,
        potentialSavings,
      };
    }
  );

  return [...results, ...pythonResults];
}

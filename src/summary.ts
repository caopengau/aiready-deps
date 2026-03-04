import type {
  ContextAnalysisResult,
  ContextSummary,
  ModuleCluster,
} from './types';
import { calculatePathEntropy, calculateDirectoryDistance } from './analyzer';

/**
 * Generate summary of context analysis results
 */
export function generateSummary(
  results: ContextAnalysisResult[]
): ContextSummary {
  if (results.length === 0) {
    return {
      totalFiles: 0,
      totalTokens: 0,
      avgContextBudget: 0,
      maxContextBudget: 0,
      avgImportDepth: 0,
      maxImportDepth: 0,
      deepFiles: [],
      avgFragmentation: 0,
      fragmentedModules: [],
      avgCohesion: 0,
      lowCohesionFiles: [],
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0,
      totalPotentialSavings: 0,
      topExpensiveFiles: [],
    };
  }

  const totalFiles = results.length;
  const totalTokens = results.reduce((sum, r) => sum + r.tokenCost, 0);
  const totalContextBudget = results.reduce(
    (sum, r) => sum + r.contextBudget,
    0
  );
  const avgContextBudget = totalContextBudget / totalFiles;
  const maxContextBudget = Math.max(...results.map((r) => r.contextBudget));

  const avgImportDepth =
    results.reduce((sum, r) => sum + r.importDepth, 0) / totalFiles;
  const maxImportDepth = Math.max(...results.map((r) => r.importDepth));

  const deepFiles = results
    .filter((r) => r.importDepth >= 5)
    .map((r) => ({ file: r.file, depth: r.importDepth }))
    .sort((a, b) => b.depth - a.depth)
    .slice(0, 10);

  const avgFragmentation =
    results.reduce((sum, r) => sum + r.fragmentationScore, 0) / totalFiles;

  const moduleMap = new Map<string, ContextAnalysisResult[]>();
  for (const result of results) {
    for (const domain of result.domains) {
      if (!moduleMap.has(domain)) moduleMap.set(domain, []);
      moduleMap.get(domain)!.push(result);
    }
  }

  const fragmentedModules: ModuleCluster[] = [];
  for (const [domain, files] of moduleMap.entries()) {
    if (files.length < 2) continue;
    const fragmentationScore =
      files.reduce((sum, f) => sum + f.fragmentationScore, 0) / files.length;
    if (fragmentationScore < 0.3) continue;

    const totalTokens = files.reduce((sum, f) => sum + f.tokenCost, 0);
    const avgCohesion =
      files.reduce((sum, f) => sum + f.cohesionScore, 0) / files.length;
    const targetFiles = Math.max(1, Math.ceil(files.length / 3));

    const filePaths = files.map((f) => f.file);
    const pathEntropy = calculatePathEntropy(filePaths);
    const directoryDistance = calculateDirectoryDistance(filePaths);

    function jaccard(a: string[], b: string[]) {
      const s1 = new Set(a || []);
      const s2 = new Set(b || []);
      if (s1.size === 0 && s2.size === 0) return 0;
      const inter = new Set([...s1].filter((x) => s2.has(x)));
      const uni = new Set([...s1, ...s2]);
      return uni.size === 0 ? 0 : inter.size / uni.size;
    }

    let importSimTotal = 0;
    let importPairs = 0;
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        importSimTotal += jaccard(
          files[i].dependencyList || [],
          files[j].dependencyList || []
        );
        importPairs++;
      }
    }

    const importCohesion = importPairs > 0 ? importSimTotal / importPairs : 0;

    fragmentedModules.push({
      domain,
      files: files.map((f) => f.file),
      totalTokens,
      fragmentationScore,
      avgCohesion,
      importCohesion,
      pathEntropy,
      directoryDistance,
      suggestedStructure: {
        targetFiles,
        consolidationPlan: [
          `Consolidate ${files.length} files across ${new Set(files.map((f) => f.file.split('/').slice(0, -1).join('/'))).size} directories`,
          `Target ~${targetFiles} core modules to reduce context switching`,
        ],
      },
    });
  }

  const avgCohesion =
    results.reduce((sum, r) => sum + r.cohesionScore, 0) / totalFiles;
  const lowCohesionFiles = results
    .filter((r) => r.cohesionScore < 0.4)
    .map((r) => ({ file: r.file, score: r.cohesionScore }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  const criticalIssues = results.filter(
    (r) => r.severity === 'critical'
  ).length;
  const majorIssues = results.filter((r) => r.severity === 'major').length;
  const minorIssues = results.filter((r) => r.severity === 'minor').length;
  const totalPotentialSavings = results.reduce(
    (sum, r) => sum + r.potentialSavings,
    0
  );

  const topExpensiveFiles = results
    .sort((a, b) => b.contextBudget - a.contextBudget)
    .slice(0, 10)
    .map((r) => ({
      file: r.file,
      contextBudget: r.contextBudget,
      severity: r.severity,
    }));

  return {
    totalFiles,
    totalTokens,
    avgContextBudget,
    maxContextBudget,
    avgImportDepth,
    maxImportDepth,
    deepFiles,
    avgFragmentation,
    fragmentedModules,
    avgCohesion,
    lowCohesionFiles,
    criticalIssues,
    majorIssues,
    minorIssues,
    totalPotentialSavings,
    topExpensiveFiles,
  };
}

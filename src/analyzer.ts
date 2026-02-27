import { calculateDependencyHealth } from '@aiready/core';
import type { DepsOptions, DepsReport, DepsIssue } from './types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function analyzeDeps(options: DepsOptions): Promise<DepsReport> {
  const rootDir = options.rootDir;
  const packageJsonPath = join(rootDir, 'package.json');

  let totalPackages = 0;
  let outdatedPackages = 0;
  let deprecatedPackages = 0;
  let trainingCutoffSkew = 0;

  const issues: DepsIssue[] = [];

  if (existsSync(packageJsonPath)) {
    try {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
        ...(pkg.peerDependencies || {}),
      };

      const depNames = Object.keys(allDeps);
      totalPackages = depNames.length;

      // Basic mock evaluation logic:
      // Without making live NPM registry calls, we scan for versions starting with <0.x or highly bumped versions.
      for (const [name, version] of Object.entries(allDeps)) {
        const vStr = String(version).replace(/[^0-9.]/g, '');
        const major = parseInt(vStr.split('.')[0] || '0', 10);

        // Mock deprecated check based on known deprecated packages
        if (
          [
            'request',
            'moment',
            'tslint',
            'mkdirp',
            'uuid',
            'node-uuid',
          ].includes(name) &&
          major < 4
        ) {
          deprecatedPackages++;
          issues.push({
            type: 'dependency-health',
            severity: 'major',
            message: `Dependency '${name}' is known to be deprecated. AI assistants may use outdated APIs.`,
            location: { file: packageJsonPath, line: 1 },
          });
        }

        // Mock outdated heuristic
        if (major === 0) {
          outdatedPackages++;
          issues.push({
            type: 'dependency-health',
            severity: 'minor',
            message: `Dependency '${name}' (${version}) is pre-v1. APIs often unstable and hard for AI to predict.`,
            location: { file: packageJsonPath, line: 1 },
          });
        }
      }

      // Mock cutoff skew (simulate some percentage based on heuristics)
      // E.g. next@15 > 2024, react@19 > 2024
      let skewSignals = 0;
      if (allDeps['next'] && allDeps['next'].includes('15')) skewSignals++;
      if (allDeps['react'] && allDeps['react'].includes('19')) skewSignals++;
      if (allDeps['typescript'] && allDeps['typescript'].includes('5.6'))
        skewSignals++;

      trainingCutoffSkew =
        totalPackages > 0 ? (skewSignals / totalPackages) * 5 : 0;
      trainingCutoffSkew = Math.min(1, trainingCutoffSkew); // cap at 1.0
    } catch {
      // ignore JSON parse errors
    }
  }

  const riskResult = calculateDependencyHealth({
    totalPackages,
    outdatedPackages,
    deprecatedPackages,
    trainingCutoffSkew,
  });

  return {
    summary: {
      filesAnalyzed: existsSync(packageJsonPath) ? 1 : 0,
      packagesAnalyzed: totalPackages,
      score: riskResult.score,
      rating: riskResult.rating,
    },
    issues,
    rawData: {
      totalPackages,
      outdatedPackages,
      deprecatedPackages,
      trainingCutoffSkew,
    },
    recommendations: riskResult.recommendations,
  };
}

import { describe, it, expect } from 'vitest';
import { analyzeIssues, isBuildArtifact } from '../issue-analyzer';
import { Severity } from '@aiready/core';

describe('analyzeIssues', () => {
  const baseParams = {
    file: 'test.ts',
    importDepth: 2,
    tokenCost: 1000,
    contextBudget: 5000,

    cohesionScore: 0.8,
    fragmentationScore: 0.3,
    maxDepth: 5,
    maxContextBudget: 25000,
    minCohesion: 0.6,
    maxFragmentation: 0.5,
    circularDeps: [] as string[][],
  };

  it('should return info severity for no issues', () => {
    const result = analyzeIssues(baseParams);

    expect(result.severity).toBe(Severity.Info);
    expect(result.issues).toHaveLength(0);
    expect(result.potentialSavings).toBe(0);
  });

  it('should detect circular dependencies as critical', () => {
    const result = analyzeIssues({
      ...baseParams,
      circularDeps: [['a.ts', 'b.ts', 'a.ts']],
    });

    expect(result.severity).toBe(Severity.Critical);
    expect(result.issues[0]).toContain('1 circular dependency chain(s)');
    expect(result.potentialSavings).toBeGreaterThan(0);
  });

  it('should detect high import depth as critical when 50% over limit', () => {
    const result = analyzeIssues({
      ...baseParams,
      importDepth: 8, // > 5 * 1.5
    });

    expect(result.severity).toBe(Severity.Critical);
    expect(result.issues[0]).toContain('exceeds limit by 50%');
  });

  it('should detect import depth over limit as major', () => {
    const result = analyzeIssues({
      ...baseParams,
      importDepth: 6, // > 5
    });

    expect(result.severity).toBe(Severity.Major);
    expect(result.issues[0]).toContain('exceeds recommended maximum');
  });

  it('should detect high context budget as critical when 50% over limit', () => {
    const result = analyzeIssues({
      ...baseParams,
      contextBudget: 40000, // > 25000 * 1.5
    });

    expect(result.severity).toBe(Severity.Critical);
    expect(result.issues[0]).toContain('50% over limit');
  });

  it('should detect context budget over limit as major', () => {
    const result = analyzeIssues({
      ...baseParams,
      contextBudget: 30000, // > 25000
    });

    expect(result.severity).toBe(Severity.Major);
    expect(result.issues[0]).toContain('exceeds');
  });

  it('should detect very low cohesion as major', () => {
    const result = analyzeIssues({
      ...baseParams,
      cohesionScore: 0.2, // < 0.6 * 0.5
    });

    expect(result.severity).toBe(Severity.Major);
    expect(result.issues[0]).toContain('Very low cohesion');
  });

  it('should detect low cohesion as minor', () => {
    const result = analyzeIssues({
      ...baseParams,
      cohesionScore: 0.4, // < 0.6
    });

    expect(result.severity).toBe(Severity.Minor);
    expect(result.issues[0]).toContain('Low cohesion');
  });

  it('should detect high fragmentation', () => {
    const result = analyzeIssues({
      ...baseParams,
      fragmentationScore: 0.8, // > 0.5
    });

    expect(result.issues[0]).toContain('High fragmentation');
  });

  it('should handle build artifact files and override severity to info', () => {
    // Use values that don't trigger any other issues, and a path that matches /dist/
    const result = analyzeIssues({
      ...baseParams,
      file: '/project/dist/bundle.js',
      importDepth: 1,
      contextBudget: 5000,
      cohesionScore: 0.9,
      fragmentationScore: 0.1,
    });

    expect(result.severity).toBe(Severity.Info);
    expect(result.issues).toContain(
      'Detected build artifact (bundled/output file)'
    );
    expect(result.potentialSavings).toBe(0);
  });
});

describe('isBuildArtifact', () => {
  it('should detect node_modules', () => {
    expect(isBuildArtifact('/project/node_modules/pkg/index.js')).toBe(true);
  });

  it('should detect dist folder', () => {
    expect(isBuildArtifact('/project/dist/bundle.js')).toBe(true);
  });

  it('should detect build folder', () => {
    expect(isBuildArtifact('/project/build/output.js')).toBe(true);
  });

  it('should detect out folder', () => {
    expect(isBuildArtifact('/project/out/main.js')).toBe(true);
  });

  it('should detect .next folder', () => {
    expect(isBuildArtifact('/project/.next/server.js')).toBe(true);
  });

  it('should not flag regular source files', () => {
    expect(isBuildArtifact('/project/src/index.ts')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isBuildArtifact('/project/Node_Modules/pkg/index.js')).toBe(true);
    expect(isBuildArtifact('/project/DIST/bundle.js')).toBe(true);
  });
});

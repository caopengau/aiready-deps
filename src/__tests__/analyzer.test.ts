import { analyzeDeps } from '../analyzer';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Deps Health Analyzer', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = join(tmpdir(), `deps-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    const packageJsonPath = join(tmpDir, 'package.json');
    writeFileSync(
      packageJsonPath,
      JSON.stringify({
        dependencies: {
          request: '^2.88.2',
          moment: '~2.29.4',
          lodash: '^0.4.0',
          react: '^19.0.0',
          next: '15.0.0-rc',
        },
        devDependencies: {
          typescript: '5.6.3',
        },
      })
    );
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects outdated, deprecated, and skew signals', async () => {
    const report = await analyzeDeps({
      rootDir: tmpDir,
      trainingCutoffYear: 2023,
    });

    expect(report.summary.packagesAnalyzed).toBe(6);

    // request, moment are known deprecated
    expect(report.rawData.deprecatedPackages).toBe(2);

    // lodash is 0.x (pre-v1) -> flagged as outdated in our mock
    expect(report.rawData.outdatedPackages).toBe(1);

    // next 15, react 19, ts 5.6 -> skew signals
    expect(report.rawData.trainingCutoffSkew).toBeGreaterThan(0);

    expect(report.issues.length).toBeGreaterThan(0);
  });
});

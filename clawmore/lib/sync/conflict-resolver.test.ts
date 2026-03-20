import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

let mockExecSync = vi.fn();

vi.mock('child_process', () => ({
  execSync: (...args: any[]) => mockExecSync(...args),
}));

describe('ConflictResolver', () => {
  let tmpDir: string;
  let rulesPath: string;

  beforeEach(() => {
    vi.resetModules();

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cr-test-'));
    // create a dummy file path that would be reported by git status
    const docsDir = path.join(tmpDir, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, 'readme.md'), '# hello');

    // write sync rules: files under docs/* are owned by 'hub'
    rulesPath = path.join(tmpDir, 'sync-rules.json');
    fs.writeFileSync(
      rulesPath,
      JSON.stringify({
        rules: [{ pattern: 'docs/*', owner: 'hub' }],
        defaultOwner: 'spoke',
      })
    );

    mockExecSync = vi.fn((command: string, opts: any) => {
      if (command.startsWith('git status')) {
        // simulate a UU unmerged file
        return 'UU docs/readme.md\n';
      }

      // simulate checkout/add commands
      if (command.includes('--theirs') || command.includes('--ours')) {
        return '';
      }

      if (command.startsWith('git add')) {
        return '';
      }

      return '';
    });
  });

  it('resolves hub-owned files by checking out theirs and adding', async () => {
    const { ConflictResolver } = await import('./conflict-resolver');
    const resolver = new ConflictResolver(rulesPath);

    await resolver.resolve(tmpDir);

    // git status should have been called, and checkout/add commands executed
    const calls = mockExecSync.mock.calls.map((c) => c[0]);
    expect(calls.some((c: string) => c.startsWith('git status'))).toBeTruthy();
    expect(calls.some((c: string) => c.includes('--theirs'))).toBeTruthy();
    expect(calls.some((c: string) => c.startsWith('git add'))).toBeTruthy();
  });
});

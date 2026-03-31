import { Severity } from '@aiready/core';
import { ContextRule } from '../types';

export const INFRA_RULES: ContextRule[] = [
  // Configuration Files - Often necessarily similar by design
  {
    name: 'config-files',
    detect: (file) => {
      return (
        file.endsWith('.config.ts') ||
        file.endsWith('.config.js') ||
        file.includes('jest.config') ||
        file.includes('vite.config') ||
        file.includes('webpack.config') ||
        file.includes('rollup.config') ||
        file.includes('tsconfig')
      );
    },
    severity: Severity.Info,
    reason: 'Configuration files often have similar structure by design',
    suggestion:
      'Consider shared config base only if configurations become hard to maintain',
  },

  // Migration Scripts - One-off scripts that are similar by nature
  {
    name: 'migration-scripts',
    detect: (file) => {
      return (
        file.includes('/migrations/') ||
        file.includes('/migrate/') ||
        file.includes('.migration.')
      );
    },
    severity: Severity.Info,
    reason: 'Migration scripts are typically one-off and intentionally similar',
    suggestion: 'Duplication is acceptable for migration scripts',
  },

  // Tool Implementations - Structural Boilerplate
  {
    name: 'tool-implementations',
    detect: (file, code) => {
      const isToolFile =
        file.includes('/tools/') ||
        file.endsWith('.tool.ts') ||
        code.includes('toolDefinitions');

      const hasToolStructure =
        code.includes('execute') &&
        (code.includes('try') || code.includes('catch'));

      return isToolFile && hasToolStructure;
    },
    severity: Severity.Info,
    reason:
      'Tool implementations share structural boilerplate but have distinct business logic',
    suggestion:
      'Tool duplication is acceptable for boilerplate interface wrappers',
  },

  // CLI Command Definitions - Commander.js boilerplate patterns
  {
    name: 'cli-command-definitions',
    detect: (file, code) => {
      const basename = file.split('/').pop() || '';
      const isCliFile =
        file.includes('/commands/') ||
        file.includes('/cli/') ||
        file.endsWith('.command.ts') ||
        basename === 'cli.ts' ||
        basename === 'cli.js' ||
        basename === 'cli.tsx' ||
        basename === 'cli-action.ts';

      const hasCommandPattern =
        (code.includes('.command(') || code.includes('defineCommand')) &&
        (code.includes('.description(') || code.includes('.option(')) &&
        (code.includes('.action(') || code.includes('async'));

      return isCliFile && hasCommandPattern;
    },
    severity: Severity.Info,
    reason:
      'CLI command definitions follow standard Commander.js patterns and are intentionally similar',
    suggestion:
      'Command boilerplate duplication is acceptable for CLI interfaces',
  },
];

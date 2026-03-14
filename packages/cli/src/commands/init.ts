import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { ToolName } from '@aiready/core';

export async function initAction(options: {
  force?: boolean;
  format?: 'json' | 'js';
}) {
  const fileExt = options.format === 'js' ? 'js' : 'json';
  const fileName = fileExt === 'js' ? 'aiready.config.js' : 'aiready.json';
  const filePath = join(process.cwd(), fileName);

  if (existsSync(filePath) && !options.force) {
    console.error(
      chalk.red(`Error: ${fileName} already exists. Use --force to overwrite.`)
    );
    process.exit(1);
  }

  const defaultConfig = {
    scan: {
      include: [
        'src/**/*.ts',
        'src/**/*.js',
        'lib/**/*.ts',
        'packages/*/src/**/*.ts',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      tools: [
        ToolName.PatternDetect,
        ToolName.ContextAnalyzer,
        ToolName.NamingConsistency,
        ToolName.AiSignalClarity,
        ToolName.AgentGrounding,
        ToolName.TestabilityIndex,
        ToolName.DocDrift,
        ToolName.DependencyHealth,
        ToolName.ChangeAmplification,
      ],
    },
    tools: {
      [ToolName.PatternDetect]: {
        minSimilarity: 0.8,
        minLines: 5,
      },
      [ToolName.ContextAnalyzer]: {
        maxContextBudget: 128000,
        minCohesion: 0.6,
      },
      [ToolName.NamingConsistency]: {
        shortWords: ['id', 'db', 'ui', 'ai'],
      },
      [ToolName.AiSignalClarity]: {
        checkMagicLiterals: true,
        checkBooleanTraps: true,
        checkAmbiguousNames: true,
        checkUndocumentedExports: true,
      },
    },
    scoring: {
      threshold: 70,
      showBreakdown: true,
    },
  };

  let content: string;
  if (fileExt === 'js') {
    content = `/** @type {import('@aiready/core').AIReadyConfig} */\nmodule.exports = ${JSON.stringify(
      defaultConfig,
      null,
      2
    )};\n`;
  } else {
    content = JSON.stringify(defaultConfig, null, 2);
  }

  try {
    writeFileSync(filePath, content, 'utf8');
    console.log(
      chalk.green(`\n✅ Created default configuration: ${chalk.bold(fileName)}`)
    );
    console.log(
      chalk.cyan('You can now fine-tune your settings and run AIReady with:')
    );
    console.log(chalk.white(`  $ aiready scan\n`));
  } catch (error) {
    console.error(chalk.red(`Failed to write configuration file: ${error}`));
    process.exit(1);
  }
}

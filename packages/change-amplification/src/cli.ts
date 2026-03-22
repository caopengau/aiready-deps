#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { analyzeChangeAmplification } from './analyzer';
import type { ChangeAmplificationOptions } from './types';
import { displayStandardConsoleReport } from '@aiready/core';

export const changeAmplificationAction = async (
  directory: string,
  options: any
) => {
  try {
    const resolvedDir = path.resolve(process.cwd(), directory);
    const finalOptions: ChangeAmplificationOptions = {
      rootDir: resolvedDir,
      include: options.include ? options.include.split(',') : undefined,
      exclude: options.exclude ? options.exclude.split(',') : undefined,
    };

    const report = await analyzeChangeAmplification(finalOptions);

    if (options.output === 'json') {
      const outputPath =
        options.outputFile || `change-amplification-report-${Date.now()}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      return;
    }

    displayStandardConsoleReport({
      title: '🌐 Change Amplification Analysis',
      score: report.summary.score ?? 0,
      rating: report.summary.rating,
      dimensions: [
        {
          name: 'Critical Issues',
          value: (report.summary.criticalIssues ?? 0) * 10,
        },
        { name: 'Major Issues', value: (report.summary.majorIssues ?? 0) * 5 },
      ],

      issues: report.results.flatMap((r: any) =>
        r.issues.map((i: any) => ({
          ...i,
          message: `[${r.fileName}] ${i.message}`,
        }))
      ),
      recommendations: report.summary.recommendations,
      elapsedTime: '0', // Not tracked in this action yet
      noIssuesMessage:
        '✨ No change amplification issues found. Architecture is well contained.',
    });
  } catch (error) {
    console.error(
      chalk.red('Error during change amplification analysis:'),
      error
    );
    process.exit(1);
  }
};

const program = new Command();
program
  .name('aiready-change-amplification')
  .description('Analyze graph metrics for change amplification')
  .argument('[directory]', 'Directory to analyze', '.')
  .option('--include <patterns>', 'File patterns to include (comma-separated)')
  .option('--exclude <patterns>', 'File patterns to exclude (comma-separated)')
  .option('-o, --output <format>', 'Output format: console, json', 'console')
  .option('--output-file <path>', 'Output file path (for json)')
  .action(changeAmplificationAction);

if (require.main === module) {
  program.parse();
}

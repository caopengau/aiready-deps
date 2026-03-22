#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeAgentGrounding } from './analyzer';
import { calculateGroundingScore } from './scoring';
import type { AgentGroundingOptions } from './types';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import {
  loadConfig,
  mergeConfigWithDefaults,
  resolveOutputPath,
  displayStandardConsoleReport,
} from '@aiready/core';

const program = new Command();

program
  .name('aiready-agent-grounding')
  .description(
    'Measure how well an AI agent can navigate your codebase autonomously'
  )
  .version('0.1.0')
  .addHelpText(
    'after',
    `
GROUNDING DIMENSIONS:
  Structure Clarity     Deep directory trees slow and confuse agents
  Self-Documentation    Vague file names (utils, helpers) hide intent
  Entry Points          README presence, freshness, and barrel exports
  API Clarity           Untyped exports prevent API contract inference
  Domain Consistency    Inconsistent naming forces agents to guess

EXAMPLES:
  aiready-agent-grounding .                        # Full analysis
  aiready-agent-grounding src/ --output json       # JSON report
  aiready-agent-grounding . --max-depth 3          # Stricter depth limit
`
  )
  .argument('<directory>', 'Directory to analyze')
  .option(
    '--max-depth <n>',
    'Max recommended directory depth (default: 4)',
    '4'
  )
  .option(
    '--readme-stale-days <n>',
    'Days after which README is considered stale (default: 90)',
    '90'
  )
  .option('--include <patterns>', 'File patterns to include (comma-separated)')
  .option('--exclude <patterns>', 'File patterns to exclude (comma-separated)')
  .option('-o, --output <format>', 'Output format: console|json', 'console')
  .option('--output-file <path>', 'Output file path (for json)')
  .action(async (directory, options) => {
    console.log(chalk.blue('🧭 Analyzing agent grounding...\n'));
    const startTime = Date.now();

    const config = await loadConfig(directory);
    const mergedConfig = mergeConfigWithDefaults(config, {
      maxRecommendedDepth: 4,
      readmeStaleDays: 90,
    });

    const finalOptions: AgentGroundingOptions = {
      rootDir: directory,
      maxRecommendedDepth:
        parseInt(options.maxDepth ?? '4', 10) ||
        mergedConfig.maxRecommendedDepth,
      readmeStaleDays:
        parseInt(options.readmeStaleDays ?? '90', 10) ||
        mergedConfig.readmeStaleDays,
      include: options.include?.split(','),
      exclude: options.exclude?.split(','),
    };

    const report = await analyzeAgentGrounding(finalOptions);
    const scoring = calculateGroundingScore(report);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (options.output === 'json') {
      const payload = { report, score: scoring };
      const outputPath = resolveOutputPath(
        options.outputFile,
        `agent-grounding-report-${new Date().toISOString().split('T')[0]}.json`,
        directory
      );
      const dir = dirname(outputPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(outputPath, JSON.stringify(payload, null, 2));
      console.log(chalk.green(`✓ Report saved to ${outputPath}`));
    } else {
      displayStandardConsoleReport({
        title: '🧭 Agent Grounding Analysis',
        score: scoring.summary.score,
        rating: scoring.summary.rating,
        dimensions: [
          {
            name: 'Structure Clarity',
            value: scoring.summary.dimensions.structureClarityScore,
          },
          {
            name: 'Self-Documentation',
            value: scoring.summary.dimensions.selfDocumentationScore,
          },
          {
            name: 'Entry Points',
            value: scoring.summary.dimensions.entryPointScore,
          },
          {
            name: 'API Clarity',
            value: scoring.summary.dimensions.apiClarityScore,
          },
          {
            name: 'Domain Consistency',
            value: scoring.summary.dimensions.domainConsistencyScore,
          },
        ],
        stats: [
          { label: 'Files', value: scoring.summary.filesAnalyzed },
          { label: 'Directories', value: scoring.summary.directoriesAnalyzed },
        ],
        issues: report.issues,
        recommendations: report.recommendations,
        elapsedTime: elapsed,
        noIssuesMessage:
          '✨ No grounding issues found — agents can navigate freely!',
      });
    }
  });

program.parse();

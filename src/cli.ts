import { Command } from 'commander';
import { analyzeDeps } from './analyzer';
import { dispatchSpokeCli } from '@aiready/core';
import pc from 'picocolors';

export function createCommand() {
  const program = new Command('deps-health')
    .description('Analyze dependency health and AI training cutoff skew')
    .option(
      '--training-cutoff-year <year>',
      'The year the target AI model was trained (e.g. 2023)',
      '2023'
    )
    .action(async (options) => {
      await dispatchSpokeCli(
        'Dependency Health',
        'dependency health',
        {
          trainingCutoffYear: parseInt(options.trainingCutoffYear, 10),
        },
        analyzeDeps
      );
    });

  return program;
}

if (require.main === module) {
  createCommand()
    .parseAsync(process.argv)
    .catch((err) => {
      console.error(pc.red(err.message));
      process.exit(1);
    });
}

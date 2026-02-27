import { Command } from 'commander';
import { analyzeDeps } from './analyzer';
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
      console.log(pc.cyan('Analyzing dependency health...'));
      const report = await analyzeDeps({
        rootDir: process.cwd(),
        trainingCutoffYear: parseInt(options.trainingCutoffYear, 10),
      });

      console.log(pc.bold('\nDependency Health Analysis Results:'));
      console.log(
        `Rating: ${report.summary.rating.toUpperCase()} (Score: ${report.summary.score})`
      );
      console.log(
        `Total packages analyzed: ${report.summary.packagesAnalyzed}`
      );

      if (report.issues.length > 0) {
        console.log(
          pc.red(`\nFound ${report.issues.length} dependency health issues.`)
        );
      } else {
        console.log(pc.green('\nDependencies are healthy for AI assistance.'));
      }
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

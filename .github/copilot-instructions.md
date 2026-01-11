# Copilot Instructions for AIReady

## Project Overview

AIReady is a monorepo containing tools for assessing AI-readiness and visualizing tech debt in codebases. The goal is to help teams prepare repositories for better AI adoption by detecting issues that confuse AI models and identifying tech debt.

## Architecture: Hub-and-Spoke Pattern

We follow a **hub-and-spoke** architecture to keep the codebase organized and maintainable:

```
@aiready/core (HUB)
    ↓
    ├─→ @aiready/pattern-detect (SPOKE)
    ├─→ @aiready/context-analyzer (SPOKE)
    ├─→ @aiready/doc-drift (SPOKE)
    ├─→ @aiready/consistency (SPOKE)
    └─→ @aiready/cli (SPOKE - aggregator)
```

### Hub: `@aiready/core`

**Purpose:** Shared utilities, types, and common functionality

**Contains:**
- Type definitions (`types.ts`) - All shared interfaces
- File scanning utilities (`utils/file-scanner.ts`)
- AST parsing helpers (`utils/ast-parser.ts`)
- Metric calculations (`utils/metrics.ts`)
- Common algorithms (similarity, token estimation, etc.)

**Rules:**
- ✅ **DO** add shared types and utilities here
- ✅ **DO** keep functions pure and generic
- ❌ **DON'T** add tool-specific logic
- ❌ **DON'T** create dependencies on spoke packages

### Spokes: Individual Tools

**Purpose:** Specialized analysis tools that solve ONE specific problem

**Each spoke should:**
- Import from `@aiready/core` only (never from other spokes)
- Provide both programmatic API and CLI
- Have its own README with clear use case
- Be independently publishable to npm
- Focus on a single analysis type

## Development Workflow

### 1. Installing Dependencies

```bash
pnpm install
```

### 2. Building All Packages

```bash
pnpm build
```

### 3. Development Mode (with watch)

```bash
# Build everything in watch mode
pnpm dev

# Or build specific package
pnpm --filter @aiready/pattern-detect dev
```

### 4. Testing

```bash
pnpm test
```

## Adding a New Tool (Spoke)

Follow these steps to add a new analysis tool:

### Step 1: Create Package Structure

```bash
mkdir -p packages/your-tool/src
cd packages/your-tool
```

### Step 2: Create `package.json`

```json
{
  "name": "@aiready/your-tool",
  "version": "0.1.0",
  "description": "Brief description of what this tool does",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "bin": {
    "aiready-yourtool": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsup src/index.ts src/cli.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts src/cli.ts --format cjs,esm --dts --watch",
    "test": "vitest run",
    "lint": "eslint src",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@aiready/core": "workspace:*",
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "tsup": "^8.3.5"
  },
  "keywords": ["aiready", "your-keywords"],
  "license": "MIT"
}
```

### Step 3: Create `src/index.ts`

```typescript
import { scanFiles, readFileContent } from '@aiready/core';
import type { AnalysisResult, Issue, ScanOptions } from '@aiready/core';

export interface YourToolOptions extends ScanOptions {
  // Your specific options
}

export async function analyzeYourTool(
  options: YourToolOptions
): Promise<AnalysisResult[]> {
  const files = await scanFiles(options);
  const results: AnalysisResult[] = [];

  // Your analysis logic here

  return results;
}
```

### Step 4: Create `src/cli.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { analyzeYourTool } from './index';
import chalk from 'chalk';

const program = new Command();

program
  .name('aiready-yourtool')
  .description('Description of your tool')
  .version('0.1.0')
  .argument('<directory>', 'Directory to analyze')
  .action(async (directory, options) => {
    console.log(chalk.blue('🔍 Analyzing...\n'));
    const results = await analyzeYourTool({ rootDir: directory });
    // Display results
  });

program.parse();
```

### Step 5: Create `tsconfig.json`

```json
{
  "extends": "../core/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Step 6: Create `README.md`

Document:
- What problem it solves
- Why it exists (vs alternatives)
- Installation
- Usage (CLI + programmatic)
- Configuration options

### Step 7: Build and Test

```bash
pnpm build
pnpm --filter @aiready/your-tool dev
```

## Common Patterns

### Adding Shared Utilities to Core

If multiple spokes need the same functionality:

1. Add to `packages/core/src/utils/`
2. Export from `packages/core/src/index.ts`
3. Import in spokes: `import { utility } from '@aiready/core'`

### Adding New Issue Types

1. Add to `IssueType` union in `packages/core/src/types.ts`
2. Use in your spoke package
3. Rebuild core: `pnpm --filter @aiready/core build`

### Token Estimation

```typescript
import { estimateTokens } from '@aiready/core';

const tokens = estimateTokens(codeString); // ~4 chars per token
```

### Similarity Scoring

```typescript
import { similarityScore } from '@aiready/core';

const score = similarityScore(code1, code2); // Returns 0-1
```

## Publishing Strategy

### Free Tier (npm packages)
- All spoke packages are free and open source
- Publish to npm with `@aiready/` scope
- Basic analysis with limited output

### Paid Tier (SaaS)
- Historical trend analysis
- Team benchmarking
- Custom rule engines
- Integration APIs
- Hosted at aiready.dev

**Upsell Funnel:**
```
Free CLI → Shows issues → "See trends" → Upgrade to Pro
```

## What Already Exists (Don't Rebuild)

- **jscpd** - Byte-level duplicate detection
- **madge** - Circular dependency graphs
- **depcheck** - Unused dependencies
- **ESLint** - Code linting
- **typescript-metrics** - Complexity metrics

**Our Differentiators:**
- Semantic duplicate detection (not byte-level)
- AI context cost estimation
- Documentation drift analysis
- Pattern consistency scoring

## File Organization

```
aiready/
├── packages/
│   ├── core/              # Hub - shared utilities
│   │   ├── src/
│   │   │   ├── types.ts           # All shared types
│   │   │   ├── index.ts           # Public exports
│   │   │   └── utils/
│   │   │       ├── file-scanner.ts
│   │   │       ├── ast-parser.ts
│   │   │       └── metrics.ts
│   │   └── package.json
│   │
│   ├── pattern-detect/    # Spoke - duplicate patterns
│   │   ├── src/
│   │   │   ├── index.ts           # Main API
│   │   │   ├── detector.ts        # Core logic
│   │   │   └── cli.ts             # CLI interface
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── [other-tools]/     # More spokes...
│
├── package.json           # Root workspace config
├── pnpm-workspace.yaml    # pnpm workspaces
├── turbo.json            # Turborepo config
└── README.md             # Project overview
```

## Key Conventions

### Naming
- Package names: `@aiready/tool-name` (kebab-case)
- CLI commands: `aiready-toolname`
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`

### Issue Severity Levels
- `critical` - Breaks AI understanding or causes bugs
- `major` - Significantly impacts AI effectiveness
- `minor` - Minor quality issues
- `info` - Suggestions for improvement

### Code Style
- TypeScript strict mode enabled
- Pure functions preferred
- Async/await over promises
- Explicit return types

## Next Steps

Current priority order:

1. ✅ **@aiready/core** - Basic utilities (DONE)
2. ✅ **@aiready/pattern-detect** - Semantic duplicates (DONE)
3. **@aiready/context-analyzer** - Token cost + fragmentation
4. **@aiready/doc-drift** - Documentation staleness
5. **@aiready/consistency** - Naming patterns
6. **@aiready/cli** - Unified interface
7. **@aiready/deps** - Wrapper for madge/depcheck

## Questions for Agent

When working on this codebase, consider:

- **Does this belong in core or a spoke?** (If multiple tools need it → core)
- **Am I creating a spoke-to-spoke dependency?** (Don't - refactor to core)
- **Is this tool independently useful?** (Should be publishable alone)
- **Does this overlap with existing tools?** (Check npm search first)
- **Can I test this on a real repo?** (Validate before over-engineering)

## Getting Help

- Check existing spoke implementations for patterns
- Review `@aiready/core` types for available utilities
- Look at `@aiready/pattern-detect` as reference implementation
- Keep spokes focused - one tool, one job

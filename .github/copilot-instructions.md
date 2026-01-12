# Copilot Instructions for AIReady

**Use doc-mapping.json for loading relevant context and practices.**

## Project Overview

AIReady is a monorepo containing tools for assessing AI-readiness and visualizing tech debt in codebases. The goal is to help teams prepare repositories for better AI adoption by detecting issues that confuse AI models and identifying tech debt.

**Mission:** As AI becomes deeply integrated into SDLC, codebases accumulate tech debt faster due to knowledge cutoff limitations, different model preferences, duplicated patterns AI doesn't recognize, and context fragmentation. AIReady helps teams assess, visualize, and prepare repositories for better AI adoption.

**Packages:**
- **[@aiready/core](packages/core)** - Shared utilities and types (HUB)
- **[@aiready/cli](packages/cli)** - Unified CLI interface and orchestration (HUB)
- **[@aiready/pattern-detect](packages/pattern-detect)** - Semantic duplicate detection for AI-generated patterns
- **[@aiready/context-analyzer](packages/context-analyzer)** - Context window cost & dependency fragmentation analysis
- **[@aiready/doc-drift](packages/doc-drift)** - Documentation freshness vs code churn tracking (Coming Soon)
- **[@aiready/consistency](packages/consistency)** - Naming & pattern consistency scoring (Coming Soon)
- **[@aiready/deps](packages/deps)** - Dependency health (wraps madge/depcheck)

**Quick Start:**
```bash
# Detect semantic duplicates
npx @aiready/pattern-detect ./src

# Analyze context costs
npx @aiready/context-analyzer ./src --output json
```

**SaaS Platform:** Free tools provide basic analysis. AIReady Pro offers historical trend analysis, team benchmarking, custom rule engines, integration APIs, and automated fix suggestions.

## Architecture: Hub-and-Spoke Pattern

We follow a **hub-and-spoke** architecture to keep the codebase organized and maintainable:

```
@aiready/core (HUB - utilities & types)
@aiready/cli (HUB - unified interface)
    ↓
    ├─→ @aiready/pattern-detect (SPOKE)
    ├─→ @aiready/context-analyzer (SPOKE)
    ├─→ @aiready/doc-drift (SPOKE)
    ├─→ @aiready/consistency (SPOKE)
    └─→ @aiready/deps (SPOKE)
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

### Hub: `@aiready/cli`

**Purpose:** Unified CLI interface and orchestration for all analysis tools

**Contains:**
- Command-line interface (`cli.ts`) - Main entry point
- Unified analysis orchestration (`index.ts`) - Coordinates multiple tools
- Output formatting and reporting
- Configuration management

**Rules:**
- ✅ **DO** provide unified interface for all spoke tools
- ✅ **DO** maintain consistent CLI patterns across tools
- ✅ **DO** support both individual tool commands and unified analysis
- ❌ **DON'T** implement analysis logic (delegate to spokes)
- ❌ **DON'T** create dependencies on spoke packages (spokes depend on CLI interface)

**Spoke Integration Requirements:**
- Each spoke MUST provide a CLI command in the unified interface
- Each spoke MUST support consistent option patterns (--output, --include, --exclude)
- Each spoke MUST return results in the unified format expected by CLI
- Each spoke MUST be importable by CLI for unified analysis

### Spokes: Individual Tools

**Purpose:** Specialized analysis tools that solve ONE specific problem

**Each spoke should:**
- Import from `@aiready/core` only (never from other spokes)
- Provide both programmatic API and CLI
- Have its own README with clear use case
- Be independently publishable to npm
- Focus on a single analysis type
- **Comply with CLI interface specifications** (see CLI hub requirements)

**CLI Integration Requirements:**
- Export functions that CLI can import for unified analysis
- Support standard CLI options (--output, --include, --exclude, --output-file)
- Return results in format expected by CLI unified reporting
- Provide individual CLI command that matches unified interface patterns

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
│   │   │   ├── cli.ts
│   │   │   ├── detector.ts
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │       └── detector.test.ts
│   │   └── package.json
│   │
│   ├── context-analyzer/  # Spoke - context costs
│   │   ├── src/
│   │   │   ├── analyzer.ts
│   │   │   ├── cli.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   │       └── analyzer.test.ts
│   │   └── package.json
│   │
│   └── [future spokes]
│
├── makefiles/             # DevOps automation
│   ├── Makefile.build.mk
│   ├── Makefile.publish.mk
│   ├── Makefile.quality.mk
│   ├── Makefile.release.mk
│   ├── Makefile.setup.mk
│   └── Makefile.shared.mk
│
├── turbo.json             # Turborepo config
├── pnpm-workspace.yaml    # Workspace config
├── pnpm-lock.yaml         # Lockfile
└── README.md              # Project overview
```

## Next Steps

Current priority order:

1. ✅ **@aiready/core** - Basic utilities (DONE)
2. ✅ **@aiready/pattern-detect** - Semantic duplicates (DONE)
3. ✅ **@aiready/context-analyzer** - Token cost + fragmentation (DONE)
4. ✅ **@aiready/cli** - Unified interface (DONE)
5. **@aiready/doc-drift** - Documentation staleness
6. **@aiready/consistency** - Naming patterns
7. **@aiready/deps** - Wrapper for madge/depcheck

### Tool Implementation Plans

- [Context Analyzer Plan](.github/plans/context-analyzer-plan.md) - Completed implementation
- [Pattern Detect Retrospective](.github/plans/pattern-detect-plan.md) - Lessons learned from first spoke

## Questions for Agent

When working on this codebase, consider:

- **Does this belong in core or a spoke?** (If multiple tools need it → core)
- **Am I creating a spoke-to-spoke dependency?** (Don't - refactor to core)
- **Is this tool independently useful?** (Should be publishable alone)
- **Does this overlap with existing tools?** (Check npm search first)
- **Can I test this on a real repo?** (Validate before over-engineering)
- **Does this comply with CLI interface specifications?** (All spokes must integrate with CLI)
- **Am I updating CLI when adding new spoke tools?** (CLI must be updated to include new tools)

## Getting Help

- Check existing spoke implementations for patterns
- Review `@aiready/core` types for available utilities
- Review `@aiready/cli` interface specifications for spoke integration
- Look at `@aiready/pattern-detect` as reference implementation
- Keep spokes focused - one tool, one job
- Ensure CLI compliance when adding new tools
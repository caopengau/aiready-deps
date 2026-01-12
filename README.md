# AIReady

> AI-readiness analysis tools for reducing tech debt and optimizing codebases for AI adoption

## 🎯 Mission

As AI becomes deeply integrated into SDLC, codebases accumulate tech debt faster due to:
- Knowledge cutoff limitations in AI models
- Different model preferences across team members
- Duplicated patterns AI doesn't recognize
- Context fragmentation that breaks AI understanding

AIReady helps teams **assess, visualize, and prepare** repositories for better AI adoption.

## 📦 Packages

### Core Tools (Free)

- **[@aiready/pattern-detect](./packages/pattern-detect)** [![npm](https://img.shields.io/npm/v/@aiready/pattern-detect)](https://www.npmjs.com/package/@aiready/pattern-detect) - Semantic duplicate detection for AI-generated patterns
- **[@aiready/context-analyzer](./packages/context-analyzer)** [![npm](https://img.shields.io/npm/v/@aiready/context-analyzer)](https://www.npmjs.com/package/@aiready/context-analyzer) - Context window cost & dependency fragmentation analysis ✨ **NEW**
- **[@aiready/doc-drift](./packages/doc-drift)** - Documentation freshness vs code churn tracking _(Coming Soon)_
- **[@aiready/consistency](./packages/consistency)** - Naming & pattern consistency scoring _(Coming Soon)_
- **[@aiready/cli](./packages/cli)** - Unified CLI for all analysis tools ✨ **NEW**

### Convenience Wrappers

- **[@aiready/deps](./packages/deps)** - Dependency health (wraps madge + depcheck)

## 🚀 Quick Start

### Using Individual Tools

```bash
# Detect semantic duplicates
npx @aiready/pattern-detect ./src

# Analyze context costs
npx @aiready/context-analyzer ./src --output json

# Or install globally
npm install -g @aiready/pattern-detect @aiready/context-analyzer
```

### Using Unified CLI

```bash
# Install CLI globally
npm install -g @aiready/cli

# Run unified analysis (patterns + context)
aiready scan .

# Run individual tools
aiready patterns . --similarity 0.6
aiready context . --max-depth 3

# Get JSON output for CI/CD
aiready scan . --output json --output-file results.json
```

## 🏗️ Development

We use a **Makefile-based workflow** for local development. See [MAKEFILE.md](./MAKEFILE.md) for full documentation.

### Quick Commands

```bash
# See all available commands
make help

# Install dependencies
make install

# Build all packages
make build

# Run tests
make test

# Fix code issues (lint + format)
make fix

# Run all quality checks
make check

# Pre-commit checks
make pre-commit
```

### Traditional pnpm Commands (still work)

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

## 📊 SaaS Platform

Free tools provide basic analysis. [AIReady Pro](https://aiready.dev) offers:
- Historical trend analysis
- Team benchmarking
- Custom rule engines
- Integration APIs
- Automated fix suggestions

## 📄 License

MIT - See LICENSE in individual packages

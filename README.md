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

- **[@aiready/pattern-detect](./packages/pattern-detect)** - Semantic duplicate detection for AI-generated patterns
- **[@aiready/context-analyzer](./packages/context-analyzer)** - Token cost & context fragmentation analysis
- **[@aiready/doc-drift](./packages/doc-drift)** - Documentation freshness vs code churn tracking
- **[@aiready/consistency](./packages/consistency)** - Naming & pattern consistency scoring
- **[@aiready/cli](./packages/cli)** - Unified CLI for all analysis tools

### Convenience Wrappers

- **[@aiready/deps](./packages/deps)** - Dependency health (wraps madge + depcheck)

## 🚀 Quick Start

```bash
# Install CLI
npm install -g @aiready/cli

# Run analysis
aiready scan .

# Get detailed report
aiready report --format html
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

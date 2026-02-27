# @aiready/deps

> AIReady Spoke: Analyzes dependency health and calculates AI training-cutoff skew.

[![npm version](https://img.shields.io/npm/v/@aiready/deps.svg)](https://npmjs.com/package/@aiready/deps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

The **Dependency Health** analyzer evaluates your `package.json` to compute timeline skews against AI knowledge cutoff dates. 

## 🏛️ Architecture

```
                    🎯 USER
                      │
                      ▼
         🎛️  @aiready/cli (orchestrator)
          │     │     │     │     │     │     │     │     │
          ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼
        [PAT] [CTX] [CON] [AMP] [DEP] [DOC] [SIG] [AGT] [TST]
          │     │     │     │     │     │     │     │     │
          └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
                               │
                               ▼
                      🏢 @aiready/core

Legend:
  PAT = pattern-detect        CTX = context-analyzer
  CON = consistency           AMP = change-amplification
  DEP = deps-health ★         DOC = doc-drift
  SIG = ai-signal-clarity     AGT = agent-grounding
  TST = testability           ★   = YOU ARE HERE
```

## Features

- **Deprecated Detection**: Identifies usage of long-deprecated packages.
- **Training-Cutoff Skew**: Measures your stack's timeline against standard AI knowledge cutoff dates.

## Installation

```bash
pnpm add @aiready/deps
```

## Usage

```bash
aiready scan . --tools deps-health
```

## License

MIT

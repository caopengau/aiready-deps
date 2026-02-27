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
           │   │   │   │   │   │   │   │   │   │   │   │
           ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
         ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐
         │A│ │B│ │C│ │D│ │E│ │F│ │G│ │H│ │I│ │J│ │K│ │L│
         └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘
         ALL SPOKES — flat peers, no hierarchy:
         A=pattern-detect    B=context-analyzer  C=consistency
         D=change-amp        E=deps-health ★      F=doc-drift
         G=ai-signal-clarity H=agent-grounding    I=testability
         J=visualizer        K=skills             L=components
           │   │   │   │   │   │   │   │   │   │   │   │
           └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                               │
                               ▼
                      🏢 @aiready/core
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

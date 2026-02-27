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
            🎛️  CLI (orchestrator)
                      │
    ┌─────────────────┴─────────────────┐
    │                                   │
    ▼                                   ▼
┌────────┐                        ┌────────┐
│🎨 VIS- │                        │ ANALY- │
│UALIZER │                        │  SIS   │
│✅ Ready│                        │ SPOKES │
└────────┘                        └───┬────┘
    │                                 │
    │   ┌───────────────┬─────────────┴─────────────┬───────────────┐
    ▼   ▼               ▼                           ▼               ▼
┌────────┐        ┌────────┐                  ┌────────┐        ┌────────┐
│📊 PAT- │        │📦 CON- │                  │🔧 CON- │        │💥 CHN- │
│TERN    │        │TEXT    │                  │SISTENCY│        │ AMP    │
│DETECT  │        │ANALYZER│                  │        │        │        │
│✅ Ready│        │✅ Ready│                  │✅ Ready│        │✅ Ready│
└────────┘        └────────┘                  └────────┘        └────────┘
    │   ┌───────────────┘       ┌───────────┐       └──────────────┐   │
    │   ▼                       ▼           ▼                      ▼   │
┌────────┐                 ┌────────┐   ┌────────┐            ┌────────┐
│📡 SIG- │                 │🤖 AGT- │   │🧪 TEST-│            │📅 DEPS-│
│ CLARITY│                 │ GROUND │   │ ABILITY│            │ HEALTH │
│✅ Ready│                 │✅ Ready│   │✅ Ready│            │✅ Ready│
└────────┘                 └────────┘   └────────┘            └────────┘
    │           │                     │                     │     ▲    │
    └───────────┴─────────────────────┴─────────────────────┴─────┴─ YOU ARE HERE ┘
                            │
                            ▼
                  🏢 HUB (@aiready/core)
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

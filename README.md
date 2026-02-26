# @aiready/deps

> AIReady Spoke: Analyzes dependency health, evaluating reliance on deprecated packages and calculating AI training-cutoff skew.

[![npm version](https://img.shields.io/npm/v/@aiready/deps.svg)](https://npmjs.com/package/@aiready/deps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

AI coding assistants are trained on data up to a specific cutoff date. When projects rely heavily on very new frameworks (post-cutoff) or deeply deprecated libraries, AI performance typically degrades. The **Dependency Health** analyzer evaluates your `package.json` to compute these skews.

## Features

- **Deprecated Detection**: Identifies usage of long-deprecated packages (e.g., old versions of `moment`, `request`).
- **Outdated Components**: Flags unstable (pre-v1) or very out-of-date core packages.
- **Training-Cutoff Skew**: Measures your stack's timeline against standard AI knowledge cutoff dates (e.g., late 2023 or 2024). Highly skewed packages limit an AI's effective context retrieval mechanisms.

## Installation

```bash
npm install -g @aiready/cli @aiready/deps
```

## Usage

This tool is designed to be run through the unified AIReady CLI.

```bash
# Analyze dependency health 
aiready scan . --tools deps-health

# Specify a customized AI training cutoff year
aiready scan . --tools deps-health --training-cutoff-year 2024
```

## License

MIT

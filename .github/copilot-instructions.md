# Copilot Instructions for AIReady

**Load doc-mapping.json for relevant context and practices.**

## Project Overview

AIReady is a monorepo with tools for assessing AI-readiness and visualizing tech debt in codebases. It helps teams prepare repositories for better AI adoption by detecting issues that confuse AI models and identifying tech debt.

**Packages:**
- **[@aiready/core](packages/core)** - Shared utilities and types (HUB)
- **[@aiready/cli](packages/cli)** - Unified CLI interface (HUB)
- **[@aiready/pattern-detect](packages/pattern-detect)** - Semantic duplicate detection
- **[@aiready/context-analyzer](packages/context-analyzer)** - Context window cost & dependency fragmentation
- Future spokes: doc-drift, consistency, deps

## Architecture: Hub-and-Spoke Pattern

- **Hubs:** @aiready/core (utilities/types), @aiready/cli (interface)
- **Spokes:** Individual analysis tools importing only from core, integrated via CLI

**Key Rules:**
- Hubs: No spoke dependencies
- Spokes: Import only from core, focus on one problem, comply with CLI specs
- All spokes must integrate with CLI (--output, --include, --exclude, unified format)

## ⚠️ COMPULSORY: Git Workflow Practices

**CRITICAL:** Before any git operations, **always load and follow** the git workflow sub-instructions:

**Load:** `git-workflow` from doc-mapping.json

**Key Rules (Never Forget):**
- ❌ **NEVER** commit directly to spoke repos
- ✅ **ALWAYS** use `make push-all` after monorepo commits
- ✅ **ALWAYS** develop in the monorepo hub
- ✅ **ALWAYS** check `make release-status` before releases

**Workflow:**
```bash
# After changes in monorepo:
git add .
git commit -m "feat: your changes"
make push-all  # ← This syncs ALL repos automatically
```

## Agent Workflow

1. **Load Context:** Use doc-mapping.json to load relevant sub-instructions based on task (e.g., development-workflow.md for coding, adding-new-tool.md for new spokes)
2. **Work:** Follow architecture rules, check existing implementations for patterns
3. **Update Docs:** After each change, update relevant docs in .github/sub-instructions/ and doc-mapping.json if needed

## Questions for Agent

- Does this belong in core or a spoke?
- Am I creating spoke-to-spoke dependencies?
- Is this tool independently useful?
- Does it overlap existing tools?
- Can I test on a real repo?
- Does it comply with CLI specs?
- Am I updating CLI for new spokes?
- **GIT:** Am I following hub-and-spoke git practices? (Always load git-workflow first!)
- **GIT:** Should I use `make push-all` or direct git commands?
- **GIT:** Is this change in the monorepo or a spoke repo?

## Getting Help

- Reference existing spokes (@aiready/pattern-detect)
- Review core types and CLI interface
- Keep spokes focused on one job
- **GIT:** Always load `git-workflow` sub-instructions before git operations
- **GIT:** Use `make push-all` instead of direct git commands
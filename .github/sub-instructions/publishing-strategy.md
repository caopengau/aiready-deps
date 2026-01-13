# Publishing Strategy Sub-Instructions

### Publishing Workflow

**Use Makefile commands (never direct npm/pnpm publish):**

```bash
# Check status
make release-status

# Release a spoke (recommended - does everything)
make release-one SPOKE=your-tool TYPE=patch

# Or manual steps:
make version-patch SPOKE=your-tool
make build
make npm-publish SPOKE=your-tool
make publish SPOKE=your-tool
```

**Important:**
- Always use `make push` after commits to sync spoke repos
- Always use `make npm-publish` (handles workspace:* protocol)
- Never use `npm publish` directly (will fail with workspace:* protocol)
- Release order: `core` first, then dependent spokes
- All spoke packages are free and open source
- Publish to npm with `@aiready/` scope

### Release Workflow

#### Quick Release (One Command)

```bash
# Check what needs releasing
make release-status

# Release a spoke (patch/minor/major)
make release-one SPOKE=context-analyzer TYPE=patch

# Examples:
make release-one SPOKE=context-analyzer TYPE=patch
make release-one SPOKE=pattern-detect TYPE=minor
make release-one SPOKE=core TYPE=major

# With 2FA
make release-one SPOKE=context-analyzer TYPE=patch OTP=123456
```

#### Pre-Release Checklist

- [ ] `make test` - All tests passing
- [ ] `make lint` - No lint errors
- [ ] `git status` - Clean working directory
- [ ] `make npm-check` - Logged into npm
- [ ] Review changes since last release
- [ ] Update README/CHANGELOG if needed

#### Status Check

```bash
# See all package versions (local vs npm)
make release-status
```

Output legend:
- `✓` = Published (local matches npm)
- `ahead` = Local is newer (needs publishing)
- `new` = Not yet on npm

#### Release Order

1. **Core first** - Always release `@aiready/core` before spokes if it changed
2. **Spokes next** - Release individual spokes in any order
3. **CLI last** - Release `@aiready/cli` after all spokes it depends on

> **⚠️ CRITICAL:** The `release-all` command automatically follows this order. Manual releases should respect dependencies to avoid version resolution issues.

#### Version Bump Guidelines

**Patch (0.1.0 → 0.1.1):** Bug fixes, documentation updates, performance improvements, internal refactoring

**Minor (0.1.0 → 0.2.0):** New features (backward compatible), new CLI options, new analysis algorithms, deprecations

**Major (0.1.0 → 1.0.0):** Breaking changes, removed features/options, changed output formats, changed API signatures

### Manual Release Workflow

1. **Version Bump:** `make version-patch SPOKE=context-analyzer`
2. **Commit & Tag:** `git add . && git commit -m "chore(release): @aiready/context-analyzer v0.2.0" && git tag -a "context-analyzer-v0.2.0"`
3. **Build:** `make build`
4. **Publish npm:** `make npm-publish SPOKE=context-analyzer [OTP=123456]`
5. **Publish GitHub:** `make publish SPOKE=context-analyzer`
6. **Push:** `git push origin main --follow-tags`

### Sync Workflow (External Contributions)

For external contributions to spoke repos:
```bash
# Pull changes from spoke repo back to monorepo
make sync-from-spoke SPOKE=context-analyzer
# Or use alias
make pull SPOKE=context-analyzer
```
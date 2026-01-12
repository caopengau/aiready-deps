# DevOps Workflow

Visual guide to AIReady's publishing and release process.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Monorepo (caopengau/aiready)                │
│                                                               │
│  packages/                                                    │
│  ├── core/           → @aiready/core                         │
│  ├── pattern-detect/ → @aiready/pattern-detect               │
│  ├── context-analyzer/ → @aiready/context-analyzer           │
│  └── [future spokes]                                         │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ git subtree split
                      ├─────────────────────────────────────┐
                      │                                     │
                      ▼                                     ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │  npm Registry            │         │  GitHub Spoke Repos      │
        │                          │         │                          │
        │  @aiready/core           │         │  aiready-core            │
        │  @aiready/pattern-detect │         │  aiready-pattern-detect  │
        │  @aiready/context-analyzer│        │  aiready-context-analyzer│
        └─────────────────────────┘         └─────────────────────────┘
                      │                                     │
                      │                                     │
                      └──────────────┬──────────────────────┘
                                     ▼
                            Users / Contributors
                          npx @aiready/context-analyzer
                          gh repo clone aiready-context-analyzer
```

## 🚀 Release Workflow

### Quick Release (Recommended)

```
┌──────────────────────────────────────────────────────────────┐
│  make -f makefiles/Makefile.release.mk release-one           │
│       SPOKE=context-analyzer TYPE=minor                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
  Check Changes                   Bump Version
  Since Last Tag                  (package.json)
        │                               │
        ▼                               ▼
   [If changed]                    Commit + Tag
        │                      (context-analyzer-v0.2.0)
        ▼                               │
   Continue                             ▼
        │                          Build Package
        │                          (tsup CJS+ESM+DTS)
        ▼                               │
        ├───────────────────────────────┤
        │                               │
        ▼                               ▼
  Publish to npm              Sync to GitHub Spoke
  (pnpm publish)              (git subtree split)
        │                               │
        └───────────────┬───────────────┘
                        ▼
                Push to Monorepo
                (branch + tags)
                        │
                        ▼
                   ✅ Complete
```

### Manual Release Workflow

```
1. VERSION BUMP
   ├─ make version-patch SPOKE=context-analyzer   (0.1.0 → 0.1.1)
   ├─ make version-minor SPOKE=context-analyzer   (0.1.0 → 0.2.0)
   └─ make version-major SPOKE=context-analyzer   (0.1.0 → 1.0.0)
                        │
                        ▼
2. COMMIT & TAG
   ├─ git add packages/context-analyzer/package.json
   ├─ git commit -m "chore(release): @aiready/context-analyzer v0.2.0"
   └─ git tag -a "context-analyzer-v0.2.0"
                        │
                        ▼
3. BUILD
   └─ make build
                        │
                        ▼
4. PUBLISH NPM
   └─ make npm-publish SPOKE=context-analyzer [OTP=123456]
                        │
                        ▼
5. PUBLISH GITHUB
   └─ make publish SPOKE=context-analyzer
                        │
                        ▼
6. PUSH
   └─ git push origin main --follow-tags
```

## 📊 Status Monitoring

```bash
$ make -f makefiles/Makefile.release.mk release-status

┌────────────────────────────────────────────────────────────┐
│ Package                     Local    npm       Status      │
├────────────────────────────────────────────────────────────┤
│ @aiready/context-analyzer   0.1.0    0.1.0     ✓ Published │
│ @aiready/core               0.2.1    0.2.0     ⚠ Ahead     │
│ @aiready/pattern-detect     0.5.1    0.5.0     ⚠ Ahead     │
└────────────────────────────────────────────────────────────┘
```

**Status Indicators:**
- `✓` **Published** - Local version matches npm (no action needed)
- `⚠ Ahead` - Local is newer than npm (ready to publish)
- `🆕 New` - Package not yet on npm (first publish)

## 🔄 Sync Workflow (External Contributions)

```
External Contributor
       │
       ▼
Fork aiready-context-analyzer
       │
       ▼
Make Changes + PR
       │
       ▼
Merge to main (spoke repo)
       │
       ▼
┌────────────────────────────────────┐
│ make sync-from-spoke                │
│      SPOKE=context-analyzer         │
└────────────────────────────────────┘
       │
       ▼
Git subtree pull
       │
       ▼
Changes merged to monorepo
packages/context-analyzer/
       │
       ▼
Review & Test
       │
       ▼
Commit to monorepo
       │
       ▼
Next release includes changes
```

## 🎯 Release Order Dependencies

```
@aiready/core (Hub)
       │
       ├─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼
pattern-detect  context-analyzer  doc-drift  consistency
       │             │             │             │
       └─────────────┴─────────────┴─────────────┘
                            │
                            ▼
                     @aiready/cli
                   (Unified Interface)
```

**Rule**: Always publish `@aiready/core` first if it has changes, then publish dependent spokes.

## 🛠️ DevOps Tools Integration

### Makefile Targets

```
Publishing:
├── make npm-publish SPOKE=context-analyzer
├── make publish SPOKE=context-analyzer
├── make npm-publish-context-analyzer      (shortcut)
└── make publish-context-analyzer          (shortcut)

Versioning:
├── make version-patch SPOKE=context-analyzer
├── make version-minor SPOKE=context-analyzer
└── make version-major SPOKE=context-analyzer

All-in-One:
├── make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=minor
└── make -f makefiles/Makefile.release.mk release-all TYPE=patch

Status:
└── make -f makefiles/Makefile.release.mk release-status
```

### pnpm Workspaces

```
workspace:* protocol in package.json
       │
       ▼
pnpm publish (auto-resolves)
       │
       ▼
Actual version in published package
```

**Example:**
```json
// In package.json
"dependencies": {
  "@aiready/core": "workspace:*"
}

// After pnpm publish
"dependencies": {
  "@aiready/core": "^0.2.1"
}
```

## 📝 Configuration Files

```
/Users/pengcao/projects/aiready/
│
├── makefiles/
│   ├── Makefile.shared.mk      ← ALL_SPOKES discovery
│   ├── Makefile.publish.mk     ← npm + GitHub publishing
│   └── Makefile.release.mk     ← One-command releases
│
├── PUBLISHING.md               ← Detailed publishing guide
├── .github/
│   └── RELEASE_CHECKLIST.md    ← Quick reference
│
└── packages/
    ├── core/
    ├── pattern-detect/
    └── context-analyzer/       ← Auto-discovered spoke
```

## 🔐 Authentication Requirements

```
npm Login
├─ make npm-check              (verify)
└─ make npm-login              (authenticate)

GitHub Access
├─ SSH keys configured
├─ Push access to monorepo
└─ Admin access to spoke repos
```

## 🎓 Best Practices

1. **Check status first**: `make -f makefiles/Makefile.release.mk release-status`
2. **Use release-one**: Single command handles everything
3. **Test before release**: `make test && make lint`
4. **Semantic versioning**: Choose appropriate bump type
5. **Clean git state**: No uncommitted changes
6. **Document changes**: Update CHANGELOG/README as needed
7. **Release core first**: If core changed, publish before spokes

## 📚 Documentation Links

- [PUBLISHING.md](../PUBLISHING.md) - Complete publishing guide
- [RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md) - Quick reference
- [MAKEFILE.md](../MAKEFILE.md) - All Makefile commands
- [.github/copilot-instructions.md](./copilot-instructions.md) - Architecture

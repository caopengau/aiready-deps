# DevOps Best Practices Sub-Instructions

### ✅ DO

1. **Use Makefile commands** - `make build`, `make test`, `make push`
2. **Run `make push` after every commit** - Keeps all spoke repos synchronized
3. **Use `make release-one`** - One command handles complete release workflow
4. **Check `make release-status`** - Know what needs publishing before releasing
5. **Release core first** - If core changes, publish before dependent spokes
6. **Test before pushing** - `make test` catches issues early

### ❌ DON'T

1. **Don't use `npm publish` directly** - Use `make npm-publish` (handles workspace:*)
2. **Don't skip `make push`** - Spoke repos will drift out of sync
3. **Don't `git push` without `make push`** - Won't sync spoke repositories
4. **Don't release spokes before core** - Core changes need to publish first
5. **Don't forget to sync** - External contributors need current code

### Command Priority

When performing DevOps tasks, prefer this order:

1. **Make commands** (highest priority) - `make build`, `make push`, `make release-one`
2. **Turbo commands** (monorepo builds) - Used internally by Make
3. **pnpm commands** (package-specific dev) - `pnpm --filter @aiready/core build`
4. **Direct commands** (avoid) - `npm publish`, `git push` alone
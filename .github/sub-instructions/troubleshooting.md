# Troubleshooting Sub-Instructions

### "Not logged into npm"

```bash
make npm-login
```

### "Repository not found" on GitHub publish

Create the spoke repository first:

```bash
gh repo create caopengau/aiready-{spoke-name} --public
```

### "workspace:* protocol" error

You're using `npm publish` instead of `pnpm publish`. Use our Makefiles:

```bash
make npm-publish SPOKE=context-analyzer
```

### Changes not detected for release

Force the release:

```bash
make release-one SPOKE=context-analyzer TYPE=patch FORCE=1
```

### Build fails before publish

Ensure all packages build successfully:

```bash
make build
make test
```

### Wrong release order causes dependency issues

If you released packages in the wrong order, you may get dependency resolution errors. The correct order is:

1. `@aiready/core` (always first)
2. Spokes: `@aiready/pattern-detect`, `@aiready/context-analyzer` (any order)
3. `@aiready/cli` (always last)

Use `make release-all` for automatic correct ordering, or release manually in dependency order.
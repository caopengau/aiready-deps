# Development Workflow Sub-Instructions

**⚠️ IMPORTANT: Always use Makefile commands for DevOps operations**

We use a **Makefile-based workflow** for all development, building, testing, and publishing. This ensures consistency and proper monorepo management.

### 1. Installing Dependencies

```bash
make install
# or: pnpm install
```

### 2. Building All Packages

```bash
make build
# or: pnpm build
```

### 3. Development Mode (with watch)

```bash
make dev
# or: pnpm dev

# Or build specific package
pnpm --filter @aiready/pattern-detect dev
```

### 4. Testing

```bash
make test
# or: pnpm test
```

### 5. Daily Workflow (RECOMMENDED)

```bash
# After making changes
git add .
git commit -m "feat: your changes"
make push  # ← Syncs monorepo + ALL spoke repos automatically
```

**💡 What `make push` does:**
- Pushes monorepo to GitHub ✅
- Syncs ALL spoke repos automatically ✅
- Skips spokes with no changes ✅
- Keeps everything in sync effortlessly ✅

### Available Make Commands

```bash
make help           # Show all available commands
make release-help   # Show release options
make install        # Install dependencies
make build          # Build all packages
make test           # Run tests
make lint           # Check code quality
make fix            # Auto-fix linting issues
make clean          # Clean build artifacts
make push           # Push + sync all spoke repos (RECOMMENDED)
make release-status # Check versions (local vs npm)
```
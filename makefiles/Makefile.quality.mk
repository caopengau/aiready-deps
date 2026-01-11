###############################################################################
# Makefile.quality: Linting, formatting, and type-checking targets
###############################################################################
include makefiles/Makefile.shared.mk

.PHONY: \
	check-all fix \
	lint lint-core lint-pattern-detect \
	lint-fix lint-fix-core lint-fix-pattern-detect \
	format format-core format-pattern-detect \
	format-check format-check-core format-check-pattern-detect \
	type-check type-check-core type-check-pattern-detect type-check-all

FORMAT_LEAF := format-check-core format-check-pattern-detect
LINT_LEAF := lint-core lint-pattern-detect
TYPE_LEAF := type-check-core type-check-pattern-detect

# Combined quality checks
check-all: ## Run format-check, lint, and type-check across the repo
	@$(call log_step,Running format check on all packages...)
	@$(MAKE) $(MAKE_PARALLEL) $(FORMAT_LEAF) $(LINT_LEAF) $(TYPE_LEAF)
	@$(call log_success,All checks passed)

check: check-all ## Alias for check-all

# Combined quality fixes
fix: ## Run ESLint --fix and Prettier format
	@$(call log_step,Applying ESLint fixes and formatting...)
	@$(MAKE) lint-fix
	@$(MAKE) format
	@$(call log_success,Codebase fixed and formatted)

# Lint targets
lint: ## Run ESLint on all packages
	@$(call log_info,Running ESLint on all packages...)
	@if command -v turbo >/dev/null 2>&1; then \
		turbo run lint; \
	else \
		$(MAKE) $(MAKE_PARALLEL) $(foreach pkg,$(PACKAGES),lint-$(pkg)); \
	fi
	@$(call log_success,All lint checks passed.)

lint-core:
	@$(call log_info,Linting core (ESLint)...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/core lint
	@$(call log_success,Core lint passed)

lint-pattern-detect:
	@$(call log_info,Linting pattern-detect (ESLint)...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/pattern-detect lint
	@$(call log_success,Pattern-detect lint passed)

# Lint fixes
lint-fix: ## Run ESLint --fix on all packages
	@$(call log_info,Auto-fixing lint issues on all packages...)
	@$(MAKE) $(MAKE_PARALLEL) $(foreach pkg,$(PACKAGES),lint-fix-$(pkg))
	@$(call log_success,All lint fixes completed)

lint-fix-core:
	@$(call log_info,Auto-fixing lint issues (core)...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/core exec eslint . --ext .ts --fix
	@$(call log_success,Core ESLint auto-fix completed)

lint-fix-pattern-detect:
	@$(call log_info,Auto-fixing lint issues (pattern-detect)...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/pattern-detect exec eslint . --ext .ts --fix
	@$(call log_success,Pattern-detect ESLint auto-fix completed)

# Format checks
format-check: ## Check formatting across all packages
	@$(call log_step,Checking formatting with Prettier...)
	@$(MAKE) $(MAKE_PARALLEL) $(FORMAT_LEAF)
	@$(call log_success,Formatting checks passed)

format-check-core:
	@$(call log_info,Checking formatting core...)
	@$(PNPM) $(SILENT_PNPM) exec prettier --check ./packages/core --ignore-path ./.prettierignore || { $(call log_error,Core formatting issues); exit 1; }

format-check-pattern-detect:
	@$(call log_info,Checking formatting pattern-detect...)
	@$(PNPM) $(SILENT_PNPM) exec prettier --check ./packages/pattern-detect --ignore-path ./.prettierignore || { $(call log_error,Pattern-detect formatting issues); exit 1; }

# Format fixes
format: ## Format all packages with Prettier
	@$(call log_step,Formatting code with Prettier...)
	@$(MAKE) $(MAKE_PARALLEL) $(foreach pkg,$(PACKAGES),format-$(pkg))
	@$(call log_success,All packages formatted)

format-core:
	@$(call log_info,Formatting core...)
	@$(PNPM) $(SILENT_PNPM) exec prettier --write ./packages/core --ignore-path ./.prettierignore
	@$(call log_success,Core formatted)

format-pattern-detect:
	@$(call log_info,Formatting pattern-detect...)
	@$(PNPM) $(SILENT_PNPM) exec prettier --write ./packages/pattern-detect --ignore-path ./.prettierignore
	@$(call log_success,Pattern-detect formatted)

# Type checking
type-check: ## Run TypeScript type-check on all packages
	@$(call log_step,Type-checking all packages...)
	@$(MAKE) $(MAKE_PARALLEL) $(TYPE_LEAF)
	@$(call log_success,All type checks passed)

type-check-core:
	@$(call log_info,Type-checking core...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/core exec tsc --noEmit
	@$(call log_success,Core type-check passed)

type-check-pattern-detect:
	@$(call log_info,Type-checking pattern-detect...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/pattern-detect exec tsc --noEmit
	@$(call log_success,Pattern-detect type-check passed)

type-check-all: type-check ## Alias for type-check

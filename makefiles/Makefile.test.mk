###############################################################################
# Makefile.test: Testing-related targets
###############################################################################
include makefiles/Makefile.shared.mk

.PHONY: test test-core test-pattern-detect test-watch test-coverage

test: ## Run tests for all packages
	@$(call log_step,Running tests for all packages...)
	@if command -v turbo >/dev/null 2>&1; then \
		turbo run test; \
	else \
		$(PNPM) test; \
	fi
	@$(call log_success,All tests passed)

test-core: ## Run tests for core package only
	@$(call log_info,Running tests for @aiready/core...)
	@$(PNPM) --filter @aiready/core test
	@$(call log_success,Core tests passed)

test-pattern-detect: ## Run tests for pattern-detect package only
	@$(call log_info,Running tests for @aiready/pattern-detect...)
	@$(PNPM) --filter @aiready/pattern-detect test
	@$(call log_success,Pattern-detect tests passed)

test-watch: ## Run tests in watch mode
	@$(call log_info,Running tests in watch mode...)
	@$(PNPM) test --watch

test-coverage: ## Run tests with coverage report
	@$(call log_step,Running tests with coverage...)
	@$(PNPM) test --coverage
	@$(call log_success,Coverage report generated)

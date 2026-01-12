# Hub includes these spokes
include makefiles/Makefile.shared.mk
include makefiles/Makefile.quality.mk
include makefiles/Makefile.setup.mk
include makefiles/Makefile.build.mk
include makefiles/Makefile.test.mk
include makefiles/Makefile.release.mk  # This includes Makefile.publish.mk

# Dynamically resolve pnpm path for use in all commands
PNPM := $(shell command -v pnpm)

.DEFAULT_GOAL := help

help-agent: help # Show optimized help for AI agents

help: ## Show all targets and descriptions in a markdown table (one aligned table per spoke, with color and emoji)
	@for f in $(wildcard makefiles/Makefile.*.mk); do \
		if ! grep -qE '^[a-zA-Z0-9_-]+:.*## ' "$$f"; then continue; fi; \
		spoke=$$(basename $$f); \
		spoke=$${spoke#Makefile.}; spoke=$${spoke%.mk}; \
		case $$spoke in \
			shared)  color=$$(tput setaf 6); emoji="🔗";; \
			quality) color=$$(tput setaf 2); emoji="🧹";; \
			setup)   color=$$(tput setaf 5); emoji="⚙️ ";; \
			build)   color=$$(tput setaf 4); emoji="🔨";; \
			test)    color=$$(tput setaf 3); emoji="🧪";; \
			release) color=$$(tput setaf 1); emoji="🚀";; \
			publish) color=$$(tput setaf 1); emoji="🚚";; \
			*)       color=$$(tput setaf 7); emoji="📦";; \
		esac; \
		echo ""; \
		echo "$${color}$${emoji} $$(echo $$spoke | tr a-z A-Z) $${emoji}$$(tput sgr0)"; \
		echo ""; \
		bold=$$(tput bold); reset=$$(tput sgr0); \
		{ \
			grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $$f | \
			while IFS= read -r line; do \
			  target=$$(printf "%s" "$$line" | sed -E 's/:.*//'); \
			  desc=$$(printf "%s" "$$line" | sed -E 's/^[^:]+:.*## //'); \
			  if [ -n "$$target" ] && [ -n "$$desc" ]; then \
			    printf "| %s%s%s%s | %s |\n" "$$color" "$$bold" "$$target" "$$reset" "$$desc"; \
			  fi; \
			done; \
		} | column -t -s'|'; \
		echo ""; \
	done

pre-commit: ## Run pre-commit checks (fix, build, check)
	@$(call log_step,Running pre-commit checks...)
	@if ! $(MAKE) fix; then \
		$(call separator,$(RED)); \
		$(call log_error,make fix failed); \
		$(call separator,$(RED)); \
		echo ""; \
		echo "➡️  Fix the inner most errors above, then gradually work outward"; \
		echo ""; \
		exit 1; \
	fi
	@if ! $(MAKE) $(MAKE_PARALLEL) build check; then \
		$(call separator,$(RED)); \
		$(call log_error,build or check failed); \
		$(call separator,$(RED)); \
		echo ""; \
		echo "➡️  Fix the inner most errors above, then gradually work outward"; \
		echo ""; \
		exit 1; \
	fi
	@$(call log_success,Pre-commit checks passed)

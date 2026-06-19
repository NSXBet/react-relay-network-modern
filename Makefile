.PHONY: install lint lint-fix typecheck test coverage build size check clean act-ci act-publish help

# Default target
help:
	@echo "Available targets:"
	@echo ""
	@echo "Development:"
	@echo "  install      - Install dependencies (bun)"
	@echo "  lint         - Run oxlint"
	@echo "  lint-fix     - Run oxlint with auto-fix"
	@echo "  typecheck    - Run TypeScript type checking (tsc --noEmit)"
	@echo "  test         - Run unit tests (vitest)"
	@echo "  coverage     - Run unit tests with coverage"
	@echo "  build        - Build the library (tsdown -> dist/)"
	@echo "  size         - Build and check bundle size + tree-shaking budgets"
	@echo "  check        - Full local gate (lint + typecheck + coverage)"
	@echo "  clean        - Remove build artifacts and deps"
	@echo ""
	@echo "Local CI (via Act, https://github.com/nektos/act):"
	@echo "  act-ci       - Run CI check jobs locally (lint, test, build, size)"
	@echo "  act-publish  - Run the Verdaccio publish test locally"

install:
	bun install

lint:
	bun run lint

lint-fix:
	bunx oxlint --fix

typecheck:
	bun run typecheck

test:
	bun run test

coverage:
	bun run coverage

build:
	bun run build

size: build
	bun run size

check:
	bun run check

clean:
	rm -rf dist
	rm -rf node_modules
	rm -rf coverage

# Run GitHub Actions locally with Act
# Requires: https://github.com/nektos/act
act-ci:
	@echo "=== Running CI check jobs locally with Act ==="
	act -j lint-and-typecheck --rm
	act -j test --rm
	act -j build --rm
	act -j size --rm
	@echo "=== All CI check jobs passed ==="

act-publish:
	@echo "=== Running Verdaccio publish test with Act ==="
	act -j test-publish --rm --artifact-server-path /tmp/act-artifacts
	@echo "=== Publish test complete ==="

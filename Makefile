# armikom-sdk-typescript — generate · build · test · drift gate
#
# Contract: api-v1.0 on Armikom.Api (196 paths · 309 operations · 297 schemas,
# info.version v1). The pinned spec is openapi/armikom-api.v1.json and its
# sha256 is recorded in openapi/armikom-api.v1.json.sha256.

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# Pinned EXACTLY. Bumping this is a deliberate act: it rewrites generated/ and
# the CI drift gate will fail until the regenerated output is committed.
# Also pinned in openapitools.json ("generator-cli".version) and package.json.
OPENAPI_GENERATOR_VERSION := 7.24.0
GENERATOR_CLI_VERSION     := 2.40.1

SPEC          := openapi/armikom-api.v1.json
SPEC_SHA      := openapi/armikom-api.v1.json.sha256
CODEGEN_COMMON:= openapi/codegen/common.yaml
CODEGEN_TS    := openapi/codegen/typescript.yaml
MERGED_CONFIG := .build/codegen.typescript.json
OUT           := generated

.PHONY: help
help:
	@echo "make verify-spec   — the pinned spec still matches its recorded sha256"
	@echo "make generate      — regenerate $(OUT)/ from the pinned spec (deterministic)"
	@echo "make build         — dual ESM/CJS build, tsc --strict"
	@echo "make test          — contract checks against the generated layer"
	@echo "make check-drift   — regenerate and fail on any diff under $(OUT)/"
	@echo "make clean         — remove build output"

node_modules: package.json package-lock.json
	npm ci
	@touch node_modules

.PHONY: verify-spec
verify-spec:
	@node scripts/verify-spec-hash.mjs

$(MERGED_CONFIG): $(CODEGEN_COMMON) $(CODEGEN_TS) scripts/merge-codegen-config.mjs | node_modules
	@node scripts/merge-codegen-config.mjs $(CODEGEN_COMMON) $(CODEGEN_TS) $@

# Deterministic: same spec + same generator version + same config => same bytes.
# Refuses to run if the pinned spec no longer matches its recorded hash.
.PHONY: generate
generate: verify-spec $(MERGED_CONFIG)
	@echo "openapi-generator $(OPENAPI_GENERATOR_VERSION) (cli $(GENERATOR_CLI_VERSION))"
	rm -rf $(OUT)
	mkdir -p $(OUT)
	OPENAPI_GENERATOR_VERSION=$(OPENAPI_GENERATOR_VERSION) \
	  npx --no-install openapi-generator-cli generate -c $(MERGED_CONFIG)
	@echo "generated files: $$(find $(OUT) -type f | wc -l | tr -d ' ')"

.PHONY: build
build: | node_modules
	rm -rf dist
	npx tsc -p tsconfig.esm.json
	npx tsc -p tsconfig.cjs.json
	node scripts/finalise-dist.mjs

.PHONY: typecheck
typecheck: | node_modules
	npx tsc -p tsconfig.json --noEmit

.PHONY: test
test: | node_modules
	rm -rf .build/checks
	npx tsc -p tsconfig.checks.json
	@printf '{\n  "type": "commonjs"\n}\n' > .build/checks/package.json
	# TZ is deliberately non-UTC: the R-4 suite cannot detect naive-local parsing
	# under TZ=UTC, and that is exactly the bug class it exists to catch.
	TZ=Europe/Istanbul node --test ".build/checks/checks/contract/"*.test.js

# The drift gate, run in CI. Regenerating must produce byte-identical output;
# if it does not, generated/ was hand-edited or the toolchain moved.
.PHONY: check-drift
check-drift: generate
	@if [ -n "$$(git status --porcelain -- $(OUT))" ]; then \
	  echo "::error::generated/ is not current — run 'make generate' and commit the result"; \
	  git --no-pager diff --stat -- $(OUT); \
	  git status --porcelain -- $(OUT); \
	  exit 1; \
	fi
	@echo "no drift under $(OUT)/"

.PHONY: clean
clean:
	rm -rf dist .build

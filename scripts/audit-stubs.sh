#!/usr/bin/env bash
# Stub Audit — Zero-stub enforcement for production code.
# Scans all production source files for TODO, FIXME, stub, mock, placeholder,
# hardcoded, dummy, not implemented patterns. Exits 1 if any found.
#
# Usage: ./scripts/audit-stubs.sh
# CI: Add as a required check that blocks PR merge.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "Running stub audit on production source files..."

PATTERN='TODO\|FIXME\|stub\|mock\|placeholder\|hardcoded\|dummy\|not.implemented\|throw.*Error.*implement'

MATCHES=$(grep -rn "$PATTERN" \
  --include="*.ts" --include="*.py" --include="*.dart" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=__pycache__ \
  --exclude-dir="dist" --exclude-dir=".next" --exclude-dir="build" \
  --exclude-dir="coverage" --exclude-dir=".turbo" \
  services/*/src/ packages/*/src/ apps/web/src/ apps/mobile/lib/ \
  2>/dev/null | \
  grep -v "__tests__" | \
  grep -v ".test." | \
  grep -v ".spec." | \
  grep -v "test_" | \
  grep -v "conftest" | \
  grep -v "vitest.config" | \
  grep -v "playwright.config" | \
  grep -v 'placeholder=' | \
  grep -v 'placeholder:' | \
  grep -v 'placeholder variables' | \
  grep -v 'loading.placeholder\|Placeholder\|shimmer.*placeholder\|placeholder.*shimmer' | \
  grep -v '// .*placeholder.*for streaming\|placeholder.*redirect' || true)

if [ -n "$MATCHES" ]; then
  echo -e "${RED}STUB AUDIT FAILED${NC}"
  echo ""
  echo "The following files contain stub/TODO/placeholder patterns:"
  echo "$MATCHES" | head -50
  TOTAL=$(echo "$MATCHES" | wc -l)
  echo ""
  echo -e "${RED}Total matches: $TOTAL${NC}"
  echo ""
  echo "All production code must be fully implemented. Remove stubs before merging."
  exit 1
else
  echo -e "${GREEN}STUB AUDIT PASSED${NC} — No stubs found in production code."
  exit 0
fi

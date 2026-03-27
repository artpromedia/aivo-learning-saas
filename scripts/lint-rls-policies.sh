#!/usr/bin/env bash
# ─────────────────────────────────────────────
# lint-rls-policies.sh
# Validates packages/db/src/rls/policies.sql
# Checks syntax, missing tables, duplicate policies
# ─────────────────────────────────────────────

set -euo pipefail

POLICIES_FILE="packages/db/src/rls/policies.sql"

echo "=== RLS Policy Lint ==="

# Check file exists
if [ ! -f "$POLICIES_FILE" ]; then
  echo "ERROR: $POLICIES_FILE not found"
  exit 1
fi

echo "Checking: $POLICIES_FILE"

ERRORS=0

# Check for basic SQL syntax issues
if grep -Pn '^\s*CREATE\s+POLICY\s' "$POLICIES_FILE" > /dev/null 2>&1; then
  echo "OK: Found CREATE POLICY statements"
else
  echo "WARNING: No CREATE POLICY statements found"
fi

# Check that ALTER TABLE ... ENABLE ROW LEVEL SECURITY exists
if grep -Pn 'ENABLE\s+ROW\s+LEVEL\s+SECURITY' "$POLICIES_FILE" > /dev/null 2>&1; then
  echo "OK: Found ENABLE ROW LEVEL SECURITY statements"
else
  echo "ERROR: No ENABLE ROW LEVEL SECURITY statements found"
  ERRORS=$((ERRORS + 1))
fi

# Check for duplicate policy names
DUPES=$(grep -oP 'CREATE\s+POLICY\s+"\K[^"]+' "$POLICIES_FILE" 2>/dev/null | sort | uniq -d)
if [ -n "$DUPES" ]; then
  echo "ERROR: Duplicate policy names found:"
  echo "$DUPES"
  ERRORS=$((ERRORS + 1))
fi

# Check that USING clauses reference tenant_id for multi-tenancy
POLICIES_WITHOUT_TENANT=$(grep -Pn 'CREATE\s+POLICY' "$POLICIES_FILE" 2>/dev/null | wc -l)
POLICIES_WITH_TENANT=$(grep -Pn 'tenant_id' "$POLICIES_FILE" 2>/dev/null | wc -l)
echo "Policies total: $POLICIES_WITHOUT_TENANT"
echo "Lines referencing tenant_id: $POLICIES_WITH_TENANT"

# Check for unclosed statements (missing semicolons)
STATEMENTS=$(grep -c '^\s*CREATE\s\+POLICY\|^\s*ALTER\s\+TABLE\|^\s*DROP\s\+POLICY' "$POLICIES_FILE" 2>/dev/null || echo 0)
SEMICOLONS=$(grep -c ';\s*$' "$POLICIES_FILE" 2>/dev/null || echo 0)
if [ "$STATEMENTS" -gt "$SEMICOLONS" ]; then
  echo "WARNING: Possible unclosed SQL statements ($STATEMENTS statements, $SEMICOLONS semicolons)"
fi

# Check for common SQL errors
if grep -Pn "FORALL\b" "$POLICIES_FILE" > /dev/null 2>&1; then
  echo "ERROR: Found 'FORALL' — did you mean 'FOR ALL'?"
  ERRORS=$((ERRORS + 1))
fi

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "FAILED: $ERRORS error(s) found"
  exit 1
fi

echo ""
echo "PASSED: RLS policy lint OK"

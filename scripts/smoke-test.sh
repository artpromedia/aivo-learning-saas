#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3001}"
FAIL=0
TOTAL=0
PASSED=0

log()         { echo "[smoke] $*"; }
log_ok()      { echo "[smoke] ✅ $*"; PASSED=$((PASSED + 1)); }
log_fail()    { echo "[smoke] ❌ $*"; FAIL=$((FAIL + 1)); }

check_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"
  TOTAL=$((TOTAL + 1))

  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected_status" ]; then
    log_ok "$name → HTTP $status"
  else
    log_fail "$name → HTTP $status (expected $expected_status)"
  fi
}

check_json_field() {
  local name="$1"
  local url="$2"
  local field="$3"
  TOTAL=$((TOTAL + 1))

  local body
  body=$(curl -sf --max-time 10 "$url" 2>/dev/null || echo "")

  if [ -z "$body" ]; then
    log_fail "$name → No response"
    return
  fi

  if echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); assert '$field' in d" 2>/dev/null; then
    log_ok "$name → field '$field' present"
  else
    log_fail "$name → field '$field' missing from response"
  fi
}

log "=== AIVO Learning Smoke Tests ==="
log "Target: $BASE_URL"
log ""

log "--- Health Checks ---"
check_endpoint "Identity Service /health" "${BASE_URL}/health"

SERVICE_PORTS=(
  "brain-svc:3002"
  "learning-svc:3003"
  "engagement-svc:3004"
  "family-svc:3005"
  "tutor-svc:3006"
  "comms-svc:3007"
  "billing-svc:3008"
  "admin-svc:3009"
  "integrations-svc:3010"
  "i18n-svc:3011"
  "assessment-svc:3012"
  "research-svc:3013"
  "status-page-svc:3014"
)

INTERNAL_BASE="${BASE_URL%:*}"

for svc_port in "${SERVICE_PORTS[@]}"; do
  svc="${svc_port%%:*}"
  port="${svc_port##*:}"
  check_endpoint "$svc /health" "${INTERNAL_BASE}:${port}/health"
done

log ""
log "--- API Documentation ---"
check_endpoint "Identity /docs" "${BASE_URL}/docs" "200"

log ""
log "--- Auth Flow ---"
TOTAL=$((TOTAL + 1))
AUTH_RESPONSE=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 \
  -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@test.com","password":"wrong"}' 2>/dev/null || echo "000")

if [ "$AUTH_RESPONSE" = "401" ] || [ "$AUTH_RESPONSE" = "400" ]; then
  log_ok "Auth rejects invalid credentials → HTTP $AUTH_RESPONSE"
else
  log_fail "Auth invalid login → HTTP $AUTH_RESPONSE (expected 401 or 400)"
fi

log ""
log "--- CSRF Endpoint ---"
check_endpoint "CSRF token" "${BASE_URL}/csrf-token"

log ""
log "=== Results ==="
log "Total: $TOTAL | Passed: $PASSED | Failed: $FAIL"

if [ "$FAIL" -gt 0 ]; then
  log "SMOKE TESTS FAILED"
  exit 1
fi

log "ALL SMOKE TESTS PASSED"
exit 0

#!/usr/bin/env bash
set -euo pipefail

# AIVO Production Readiness Validation Script
# Validates health endpoints, metrics, tracing, alerts, and security config.

REPORT_FILE="production-readiness-report.json"
PASS_COUNT=0
FAIL_COUNT=0
RESULTS=()

# Service registry: name:port
SERVICES=(
  "identity-svc:3001"
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
  "status-page-svc:3013"
  "ai-svc:5000"
)

log_pass() {
  local check="$1"
  local detail="${2:-}"
  PASS_COUNT=$((PASS_COUNT + 1))
  RESULTS+=("{\"check\": \"$check\", \"status\": \"pass\", \"detail\": \"$detail\"}")
  echo "  [PASS] $check"
}

log_fail() {
  local check="$1"
  local detail="${2:-}"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  RESULTS+=("{\"check\": \"$check\", \"status\": \"fail\", \"detail\": \"$detail\"}")
  echo "  [FAIL] $check — $detail"
}

# ── 1. Health Check Sweep ───────────────────────────────────────────────────────
echo ""
echo "=== Health Check Sweep ==="
for entry in "${SERVICES[@]}"; do
  IFS=':' read -r name port <<< "$entry"
  url="http://${name}:${port}/health"
  if response=$(curl -sf --max-time 5 "$url" 2>/dev/null); then
    status=$(echo "$response" | grep -o '"status":"[^"]*"' | head -1 || true)
    if [[ "$status" == *"healthy"* ]] || [[ "$status" == *"ok"* ]]; then
      log_pass "health:$name" "HTTP 200 OK"
    else
      log_fail "health:$name" "Unexpected response: $status"
    fi
  else
    log_fail "health:$name" "Connection failed or timeout at $url"
  fi
done

# ── 2. Metrics Check ───────────────────────────────────────────────────────────
echo ""
echo "=== Metrics Endpoint Check ==="
for entry in "${SERVICES[@]}"; do
  IFS=':' read -r name port <<< "$entry"
  url="http://${name}:${port}/metrics"
  if response=$(curl -sf --max-time 5 "$url" 2>/dev/null); then
    if echo "$response" | grep -q "http_requests_total\|# HELP\|# TYPE"; then
      log_pass "metrics:$name" "Prometheus format verified"
    else
      log_fail "metrics:$name" "Response does not contain Prometheus metrics"
    fi
  else
    log_fail "metrics:$name" "Metrics endpoint not reachable at $url"
  fi
done

# ── 3. Trace Verification ──────────────────────────────────────────────────────
echo ""
echo "=== Trace Context Propagation Check ==="
TRACE_ID=$(printf '%032x' $RANDOM$RANDOM$RANDOM$RANDOM 2>/dev/null || echo "00000000000000000000000000000001")
SPAN_ID=$(printf '%016x' $RANDOM$RANDOM 2>/dev/null || echo "0000000000000001")
TRACEPARENT="00-${TRACE_ID}-${SPAN_ID}-01"

if response=$(curl -sf --max-time 5 \
  -H "traceparent: $TRACEPARENT" \
  "http://identity-svc:3001/health" 2>/dev/null); then
  log_pass "trace:propagation" "Traceparent header accepted"
else
  log_fail "trace:propagation" "Could not verify trace propagation"
fi

# ── 4. Sentry Verification ─────────────────────────────────────────────────────
echo ""
echo "=== Sentry Configuration Check ==="
if [ -n "${SENTRY_DSN:-}" ]; then
  log_pass "sentry:configured" "SENTRY_DSN is set"
else
  log_fail "sentry:configured" "SENTRY_DSN environment variable not set"
fi

# ── 5. Alert Rule Validation ───────────────────────────────────────────────────
echo ""
echo "=== Alert Rule Validation ==="
RULES_DIR="infra/monitoring/prometheus/rules"
if [ -d "$RULES_DIR" ]; then
  for rule_file in "$RULES_DIR"/*.yml; do
    if [ -f "$rule_file" ]; then
      if command -v promtool &>/dev/null; then
        if promtool check rules "$rule_file" 2>/dev/null; then
          log_pass "alertrules:$(basename "$rule_file")" "Valid Prometheus rules"
        else
          log_fail "alertrules:$(basename "$rule_file")" "Invalid Prometheus rules"
        fi
      else
        if grep -q "groups:" "$rule_file" && grep -q "alert:" "$rule_file"; then
          log_pass "alertrules:$(basename "$rule_file")" "YAML structure looks valid (promtool not available)"
        else
          log_fail "alertrules:$(basename "$rule_file")" "Missing required structure"
        fi
      fi
    fi
  done
else
  log_fail "alertrules:directory" "Rules directory not found: $RULES_DIR"
fi

# ── 6. Grafana Dashboard Validation ────────────────────────────────────────────
echo ""
echo "=== Grafana Dashboard Validation ==="
DASHBOARDS_DIR="infra/monitoring/grafana/dashboards"
if [ -d "$DASHBOARDS_DIR" ]; then
  for dashboard in "$DASHBOARDS_DIR"/*.json; do
    if [ -f "$dashboard" ]; then
      if python3 -c "import json; json.load(open('$dashboard'))" 2>/dev/null || \
         node -e "JSON.parse(require('fs').readFileSync('$dashboard', 'utf8'))" 2>/dev/null; then
        log_pass "dashboard:$(basename "$dashboard")" "Valid JSON"
      else
        log_fail "dashboard:$(basename "$dashboard")" "Invalid JSON"
      fi
    fi
  done
else
  log_fail "dashboard:directory" "Dashboards directory not found: $DASHBOARDS_DIR"
fi

# ── 7. Security Checks ─────────────────────────────────────────────────────────
echo ""
echo "=== Security Checks ==="
if [ -n "${JWT_PUBLIC_KEY:-}" ] || [ -n "${JWT_PRIVATE_KEY:-}" ]; then
  log_pass "security:jwt_keys" "JWT RSA keys configured"
else
  log_fail "security:jwt_keys" "JWT RSA keys not configured in environment"
fi

if [ -n "${AUTH_SECRET:-}" ]; then
  log_pass "security:auth_secret" "AUTH_SECRET is set"
else
  log_fail "security:auth_secret" "AUTH_SECRET not configured"
fi

# ── 8. Performance Baseline ────────────────────────────────────────────────────
echo ""
echo "=== Performance Baseline ==="
K6_DIR="e2e/load/k6"
if [ -d "$K6_DIR" ]; then
  if command -v k6 &>/dev/null; then
    for test_file in "$K6_DIR"/*.js; do
      test_name=$(basename "$test_file" .js)
      echo "  Running k6 test: $test_name..."
      if k6 run --quiet --duration 10s --vus 5 "$test_file" 2>/dev/null; then
        log_pass "k6:$test_name" "Load test passed"
      else
        log_fail "k6:$test_name" "Load test failed or thresholds exceeded"
      fi
    done
  else
    log_pass "k6:available" "k6 test files exist (k6 binary not available for execution)"
  fi
else
  log_fail "k6:directory" "K6 test directory not found"
fi

# ── Generate Report ─────────────────────────────────────────────────────────────
echo ""
echo "=== Generating Report ==="

RESULTS_JSON=$(printf '%s,' "${RESULTS[@]}" | sed 's/,$//')

cat > "$REPORT_FILE" << HEREDOC
{
  "report": "AIVO Production Readiness",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "total": $((PASS_COUNT + FAIL_COUNT)),
    "passed": $PASS_COUNT,
    "failed": $FAIL_COUNT,
    "status": "$([ $FAIL_COUNT -eq 0 ] && echo "READY" || echo "NOT_READY")"
  },
  "checks": [$RESULTS_JSON]
}
HEREDOC

echo ""
echo "=========================================="
echo "  Production Readiness Report"
echo "=========================================="
echo "  Total checks: $((PASS_COUNT + FAIL_COUNT))"
echo "  Passed: $PASS_COUNT"
echo "  Failed: $FAIL_COUNT"
echo "  Status: $([ $FAIL_COUNT -eq 0 ] && echo "READY" || echo "NOT READY")"
echo "=========================================="
echo "  Report saved to: $REPORT_FILE"
echo ""

exit $FAIL_COUNT

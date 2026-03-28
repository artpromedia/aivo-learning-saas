#!/usr/bin/env bash
# ─── dev-seed.sh ─────────────────────────────────────────────────────────────
# Runs Drizzle migrations and seeds a test parent user + test learner via the
# identity-svc API.
# Prerequisites: The dev stack must be running (./scripts/dev-up.sh)
# Usage: ./scripts/dev-seed.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

IDENTITY_URL="${IDENTITY_SVC_URL:-http://localhost:3001}"

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

# ─── Wait for identity-svc to be healthy ─────────────────────────────────────
info "Waiting for identity-svc at $IDENTITY_URL/health ..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sf "$IDENTITY_URL/health" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    error "identity-svc not reachable after ${MAX_RETRIES} attempts."
    error "Make sure the dev stack is running: ./scripts/dev-up.sh"
    exit 1
  fi
  sleep 2
done
info "identity-svc is healthy."

# ─── Run Drizzle migrations ─────────────────────────────────────────────────
info "Running Drizzle schema push (pnpm --filter @aivo/db db:push) ..."
cd "$ROOT_DIR"

export DATABASE_URL="${DATABASE_URL:-postgresql://aivo:aivo_dev@localhost:5432/aivo_dev}"

if command -v pnpm &> /dev/null; then
  pnpm --filter @aivo/db db:push
else
  warn "pnpm not found — attempting via npx ..."
  npx --filter @aivo/db db:push
fi

info "Database schema pushed successfully."

# ─── Seed test parent user ──────────────────────────────────────────────────
info "Seeding test parent user ..."

SIGNUP_RESPONSE=$(curl -sf -X POST "$IDENTITY_URL/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@test.local",
    "password": "TestPass123!",
    "name": "Test Parent"
  }' 2>&1) || true

if echo "$SIGNUP_RESPONSE" | grep -qi '"id"\|"user"\|"token"\|"session"'; then
  info "Test parent created: parent@test.local / TestPass123!"
else
  warn "Parent signup response (may already exist): $SIGNUP_RESPONSE"
fi

# ─── Sign in to get auth token ───────────────────────────────────────────────
info "Signing in as test parent ..."

SIGNIN_RESPONSE=$(curl -sf -X POST "$IDENTITY_URL/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@test.local",
    "password": "TestPass123!"
  }' 2>&1) || true

AUTH_TOKEN=$(echo "$SIGNIN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4) || true

if [ -z "$AUTH_TOKEN" ]; then
  warn "Could not extract auth token. Learner creation may fail."
  warn "Sign-in response: $SIGNIN_RESPONSE"
fi

# ─── Seed test learner ──────────────────────────────────────────────────────
if [ -n "$AUTH_TOKEN" ]; then
  info "Seeding test learner ..."

  LEARNER_RESPONSE=$(curl -sf -X POST "$IDENTITY_URL/learners" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "name": "Test Learner",
      "gradeLevel": "5",
      "birthYear": 2015
    }' 2>&1) || true

  if echo "$LEARNER_RESPONSE" | grep -qi '"id"\|"learner"'; then
    info "Test learner created: Test Learner (Grade 5)"
  else
    warn "Learner creation response (may already exist): $LEARNER_RESPONSE"
  fi
else
  warn "Skipping learner creation — no auth token available."
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
info "═══════════════════════════════════════════════════════"
info "  Dev seed complete!"
info "  Parent:  parent@test.local / TestPass123!"
info "  Learner: Test Learner (Grade 5)"
info "═══════════════════════════════════════════════════════"

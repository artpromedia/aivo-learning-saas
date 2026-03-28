#!/usr/bin/env bash
# ─── dev-up.sh ───────────────────────────────────────────────────────────────
# Generates JWT RS256 keypair if missing, exports them, and starts the full
# AIVO Learning docker-compose dev stack.
# Usage: ./scripts/dev-up.sh [extra docker compose flags...]
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

KEY_DIR="$ROOT_DIR/.keys"
PRIVATE_KEY_FILE="$KEY_DIR/jwt_private.pem"
PUBLIC_KEY_FILE="$KEY_DIR/jwt_public.pem"

# ─── Generate JWT RS256 keypair if missing ───────────────────────────────────
if [ ! -f "$PRIVATE_KEY_FILE" ] || [ ! -f "$PUBLIC_KEY_FILE" ]; then
  echo "🔑 Generating RS256 JWT keypair..."
  mkdir -p "$KEY_DIR"
  openssl genpkey -algorithm RSA -out "$PRIVATE_KEY_FILE" -pkeyopt rsa_keygen_bits:2048 2>/dev/null
  openssl rsa -in "$PRIVATE_KEY_FILE" -pubout -out "$PUBLIC_KEY_FILE" 2>/dev/null
  chmod 600 "$PRIVATE_KEY_FILE"
  chmod 644 "$PUBLIC_KEY_FILE"
  echo "   Private key: $PRIVATE_KEY_FILE"
  echo "   Public key:  $PUBLIC_KEY_FILE"
else
  echo "🔑 JWT keypair already exists at $KEY_DIR"
fi

# ─── Export keys as environment variables ────────────────────────────────────
export JWT_PRIVATE_KEY
JWT_PRIVATE_KEY="$(cat "$PRIVATE_KEY_FILE")"

export JWT_PUBLIC_KEY
JWT_PUBLIC_KEY="$(cat "$PUBLIC_KEY_FILE")"

# ─── Load .env if present ───────────────────────────────────────────────────
if [ -f "$ROOT_DIR/.env" ]; then
  echo "📄 Loading .env file..."
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

# ─── Start the stack ────────────────────────────────────────────────────────
echo ""
echo "🚀 Starting AIVO Learning dev stack..."
echo "   Services: postgres, redis, nats + 11 microservices"
echo "   Compose file: docker-compose.dev.yml"
echo ""

cd "$ROOT_DIR"
docker compose -f docker-compose.dev.yml up --build "$@"

#!/bin/bash
set -e

echo "=== Starting identity-svc ==="
cd services/identity-svc && NODE_ENV=production node dist/index.js &
IDENTITY_PID=$!
cd ../..

sleep 2

echo "=== Starting Next.js ==="
cd apps/web && NODE_ENV=production npx next start -p 5000 -H 0.0.0.0 &
NEXT_PID=$!
cd ../..

cleanup() {
  kill $IDENTITY_PID $NEXT_PID 2>/dev/null
  wait $IDENTITY_PID $NEXT_PID 2>/dev/null
}
trap cleanup EXIT INT TERM

wait -n
exit $?

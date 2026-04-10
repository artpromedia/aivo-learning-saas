#!/usr/bin/env bash
set -e

echo "=== Starting Infrastructure ==="

if ! redis-cli ping &>/dev/null 2>&1; then
  redis-server --daemonize yes --port 6379 --bind 127.0.0.1 --loglevel warning --save "" 2>/dev/null || true
  echo "Redis started on port 6379"
else
  echo "Redis already running"
fi

if ! curl -sf http://localhost:8222/ &>/dev/null; then
  nats-server -p 4222 -m 8222 -js -sd /tmp/nats-data --pid /tmp/nats.pid &>/tmp/nats.log &
  sleep 1
  echo "NATS started on port 4222"
else
  echo "NATS already running"
fi

echo "=== Starting Backend Services ==="

export NODE_ENV=development

PIDS=()

cd /home/runner/workspace

cd services/learning-svc && tsx src/index.ts &
PIDS+=($!)
echo "learning-svc starting (PID ${PIDS[-1]}) on port 3003"

cd /home/runner/workspace
cd services/engagement-svc && tsx src/index.ts &
PIDS+=($!)
echo "engagement-svc starting (PID ${PIDS[-1]}) on port 3004"

cd /home/runner/workspace
cd services/tutor-svc && tsx src/index.ts &
PIDS+=($!)
echo "tutor-svc starting (PID ${PIDS[-1]}) on port 3006"

cd /home/runner/workspace
cd services/family-svc && tsx src/index.ts &
PIDS+=($!)
echo "family-svc starting (PID ${PIDS[-1]}) on port 3005"

cd /home/runner/workspace
cd services/assessment-svc && tsx src/index.ts &
PIDS+=($!)
echo "assessment-svc starting (PID ${PIDS[-1]}) on port 3012"

cd /home/runner/workspace
cd services/comms-svc && tsx src/index.ts &
PIDS+=($!)
echo "comms-svc starting (PID ${PIDS[-1]}) on port 3007"

cd /home/runner/workspace
cd services/billing-svc && tsx src/index.ts &
PIDS+=($!)
echo "billing-svc starting (PID ${PIDS[-1]}) on port 3008"

cd /home/runner/workspace
cd services/admin-svc && tsx src/index.ts &
PIDS+=($!)
echo "admin-svc starting (PID ${PIDS[-1]}) on port 3009"

cd /home/runner/workspace
cd services/integrations-svc && tsx src/index.ts &
PIDS+=($!)
echo "integrations-svc starting (PID ${PIDS[-1]}) on port 3010"

cd /home/runner/workspace
cd services/i18n-svc && tsx src/index.ts &
PIDS+=($!)
echo "i18n-svc starting (PID ${PIDS[-1]}) on port 3011"

cd /home/runner/workspace
cd services/research-svc && tsx src/index.ts &
PIDS+=($!)
echo "research-svc starting (PID ${PIDS[-1]}) on port 3013"

cd /home/runner/workspace
cd services/status-page-svc && tsx src/index.ts &
PIDS+=($!)
echo "status-page-svc starting (PID ${PIDS[-1]}) on port 3014"

cd /home/runner/workspace
cd services/ai-svc && PORT=3015 PYTHONPATH=src python3 -m uvicorn ai_svc.main:app --host 0.0.0.0 --port 3015 &
PIDS+=($!)
echo "ai-svc starting (PID ${PIDS[-1]}) on port 3015"

echo "=== All 13 services launched ==="

cleanup() {
  echo "Shutting down services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait
}
trap cleanup SIGTERM SIGINT

wait

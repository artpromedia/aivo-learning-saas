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

cd /home/runner/workspace

cd services/learning-svc && tsx src/index.ts &
LEARNING_PID=$!
echo "learning-svc starting (PID $LEARNING_PID) on port 3003"

cd /home/runner/workspace
cd services/engagement-svc && tsx src/index.ts &
ENGAGEMENT_PID=$!
echo "engagement-svc starting (PID $ENGAGEMENT_PID) on port 3004"

cd /home/runner/workspace
cd services/tutor-svc && tsx src/index.ts &
TUTOR_PID=$!
echo "tutor-svc starting (PID $TUTOR_PID) on port 3006"

cd /home/runner/workspace
cd services/family-svc && tsx src/index.ts &
FAMILY_PID=$!
echo "family-svc starting (PID $FAMILY_PID) on port 3005"

cd /home/runner/workspace
cd services/assessment-svc && tsx src/index.ts &
ASSESSMENT_PID=$!
echo "assessment-svc starting (PID $ASSESSMENT_PID) on port 3012"

echo "=== All services launched ==="

cleanup() {
  echo "Shutting down services..."
  kill $LEARNING_PID $ENGAGEMENT_PID $TUTOR_PID $FAMILY_PID $ASSESSMENT_PID 2>/dev/null || true
  wait
}
trap cleanup SIGTERM SIGINT

wait

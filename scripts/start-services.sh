#!/bin/bash
set -e

echo "Starting AIVO backend services..."

echo "Starting identity-svc on port 3001..."
cd /home/runner/workspace/services/identity-svc
NODE_ENV=development npx tsx src/index.ts &

echo "Starting assessment-svc on port 3003..."
cd /home/runner/workspace/services/assessment-svc
ASSESSMENT_PORT=3003 NODE_ENV=development npx tsx src/index.ts &

wait

#!/usr/bin/env bash
set -e

echo "Starting infrastructure services..."

if ! redis-cli ping &>/dev/null; then
  redis-server --daemonize yes --port 6379 --bind 127.0.0.1 --loglevel warning --save "" 2>/dev/null
  echo "Redis started on port 6379"
else
  echo "Redis already running"
fi

if ! curl -s http://localhost:8222/ &>/dev/null; then
  nats-server -p 4222 -m 8222 -js -sd /tmp/nats-data --pid /tmp/nats.pid &>/tmp/nats.log &
  sleep 1
  echo "NATS started on port 4222 (JetStream enabled)"
else
  echo "NATS already running"
fi

echo "Infrastructure ready"

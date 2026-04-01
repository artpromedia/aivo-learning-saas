#!/bin/sh
export OTEL_SDK_DISABLED=true
cd /app
timeout 10 node services/billing-svc/dist/index.js
echo "EXIT=$?"

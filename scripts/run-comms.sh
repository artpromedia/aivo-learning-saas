#!/bin/bash
echo "=== Running comms-svc dist/index.js with debug ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c '
  cd /app
  timeout 20 /usr/local/bin/node --trace-warnings services/comms-svc/dist/index.js 2>&1
  echo "TIMEOUT exit: $?"
'

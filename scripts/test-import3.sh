#!/bin/bash
# admin-svc test
echo "=== Testing import from admin-svc context ==="
kubectl exec admin-svc-797cd54ff9-lcntm -n aivo -- sh -c '
echo "console.log(\"testing...\"); import(\"@aivo/observability\").then(m => { console.log(\"OK:\", Object.keys(m).join(\",\")); process.exit(0); }).catch(e => { console.error(\"FAIL:\", e.message); process.exit(1); });" > /tmp/t.js
cd /app/services/admin-svc && timeout 15 /usr/local/bin/node /tmp/t.js 2>&1
echo "exit: $?"
'

echo ""
echo "=== Testing import from comms-svc context ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c '
echo "console.log(\"testing...\"); import(\"@aivo/observability\").then(m => { console.log(\"OK:\", Object.keys(m).join(\",\")); process.exit(0); }).catch(e => { console.error(\"FAIL:\", e.message); process.exit(1); });" > /tmp/t.js
cd /app/services/comms-svc && timeout 15 /usr/local/bin/node /tmp/t.js 2>&1
echo "exit: $?"
'

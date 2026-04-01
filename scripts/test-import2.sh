#!/bin/bash
# Write test script directly into the dist dirs
echo "=== Testing import from admin-svc dist location ==="
kubectl exec admin-svc-797cd54ff9-lcntm -n aivo -- sh -c '
cat > /app/services/admin-svc/dist/test-obs.mjs << "EOF"
console.log("testing import...");
try {
  const m = await import("@aivo/observability");
  console.log("SUCCESS, keys:", Object.keys(m).join(","));
  process.exit(0);
} catch(e) {
  console.error("FAIL:", e.message);
  process.exit(1);
}
EOF
timeout 15 /usr/local/bin/node /app/services/admin-svc/dist/test-obs.mjs 2>&1; echo "exit: $?"
rm /app/services/admin-svc/dist/test-obs.mjs
'

echo ""
echo "=== Testing import from comms-svc dist location ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c '
cat > /app/services/comms-svc/dist/test-obs.mjs << "EOF"
console.log("testing import...");
try {
  const m = await import("@aivo/observability");
  console.log("SUCCESS, keys:", Object.keys(m).join(","));
  process.exit(0);
} catch(e) {
  console.error("FAIL:", e.message);
  process.exit(1);
}
EOF
timeout 15 /usr/local/bin/node /app/services/comms-svc/dist/test-obs.mjs 2>&1; echo "exit: $?"
rm /app/services/comms-svc/dist/test-obs.mjs
'

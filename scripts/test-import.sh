#!/bin/bash
# Test import from within the service directory context
echo "=== admin-svc: test import ==="
kubectl exec admin-svc-797cd54ff9-lcntm -n aivo -- sh -c '
cat > /tmp/test2.mjs << "EOF"
console.log("cwd:", process.cwd());
try {
  const m = await import("@aivo/observability");
  console.log("import OK, keys:", Object.keys(m));
  process.exit(0);
} catch(e) {
  console.error("import FAILED:", e.message);
  process.exit(1);
}
EOF
cd /app && /usr/local/bin/node /tmp/test2.mjs 2>&1
'

echo ""
echo "=== comms-svc: test import ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c '
cat > /tmp/test2.mjs << "EOF"
console.log("cwd:", process.cwd());
try {
  const m = await import("@aivo/observability");
  console.log("import OK, keys:", Object.keys(m));
  process.exit(0);
} catch(e) {
  console.error("import FAILED:", e.message);
  process.exit(1);
}
EOF
cd /app && /usr/local/bin/node /tmp/test2.mjs 2>&1
'

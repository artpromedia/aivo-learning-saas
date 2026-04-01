#!/bin/bash
# Write a test script into the admin (working) container
kubectl exec admin-svc-797cd54ff9-lcntm -n aivo -- sh -c 'cat > /tmp/test-obs.mjs << "INNEREOF"
console.log("before import");
const { observabilityPlugin, initTracing } = await import("@aivo/observability");
console.log("import ok, type:", typeof observabilityPlugin);
console.log("testing initTracing...");
const sdk = initTracing({ serviceName: "test", environment: "test" });
console.log("initTracing ok");
sdk.shutdown().then(() => { console.log("shutdown ok"); process.exit(0); });
INNEREOF'

echo "=== Running in admin-svc (working) ==="
kubectl exec admin-svc-797cd54ff9-lcntm -n aivo -- sh -c 'cd /app/services/admin-svc && timeout 15 /usr/local/bin/node /tmp/test-obs.mjs 2>&1; echo "EXIT: $?"'

# Write same script into comms (hanging) container
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c 'cat > /tmp/test-obs.mjs << "INNEREOF"
console.log("before import");
const { observabilityPlugin, initTracing } = await import("@aivo/observability");
console.log("import ok, type:", typeof observabilityPlugin);
console.log("testing initTracing...");
const sdk = initTracing({ serviceName: "test", environment: "test" });
console.log("initTracing ok");
sdk.shutdown().then(() => { console.log("shutdown ok"); process.exit(0); });
INNEREOF'

echo "=== Running in comms-svc (hanging) ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c 'cd /app/services/comms-svc && timeout 15 /usr/local/bin/node /tmp/test-obs.mjs 2>&1; echo "EXIT: $?"'

#!/bin/bash
echo "=== admin-svc image created ==="
kubectl exec admin-svc-797cd54ff9-lcntm -n aivo -- stat /app/services/admin-svc/dist/index.js 2>&1 | grep -i modify

echo "=== comms-svc image created ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- stat /app/services/comms-svc/dist/index.js 2>&1 | grep -i modify

echo "=== billing-svc image created ==="
kubectl exec billing-svc-77b46457c-fbz9c -n aivo -- stat /app/services/billing-svc/dist/index.js 2>&1 | grep -i modify

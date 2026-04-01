#!/bin/bash
for pod in comms-svc-5f9d8d64d5-zzttg family-svc-5568cb48d6-zcrrb; do
  echo "=== $pod ==="
  kubectl exec "$pod" -n aivo -- env | grep -E 'DATABASE_URL|NATS_URL|REDIS_URL|PORT' 2>&1
done

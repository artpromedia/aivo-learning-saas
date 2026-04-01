#!/bin/bash
echo "=== Testing DB connectivity from comms-svc ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c 'timeout 5 sh -c "echo > /dev/tcp/10.0.0.1/5432" 2>&1 && echo "DB: OK" || echo "DB: FAILED"'

echo "=== Testing NATS connectivity from comms-svc ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c 'timeout 5 sh -c "echo > /dev/tcp/nats.aivo.svc.cluster.local/4222" 2>&1 && echo "NATS: OK" || echo "NATS: FAILED"'

echo "=== Testing Redis connectivity from comms-svc ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- sh -c 'timeout 5 sh -c "echo > /dev/tcp/10.0.0.1/6379" 2>&1 && echo "REDIS: OK" || echo "REDIS: FAILED"'

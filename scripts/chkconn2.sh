#!/bin/bash
echo "=== Testing DB (10.0.0.1:5432) from comms-svc ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- timeout 5 wget -q -O /dev/null http://10.0.0.1:5432 2>&1; echo "exit: $?"

echo "=== Testing NATS (nats.aivo.svc.cluster.local:4222) from comms-svc ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- timeout 5 wget -q -O /dev/null http://nats.aivo.svc.cluster.local:4222 2>&1; echo "exit: $?"

echo "=== Testing Redis (10.0.0.1:6379) from comms-svc ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- timeout 5 wget -q -O /dev/null http://10.0.0.1:6379 2>&1; echo "exit: $?"

echo "=== Testing DNS ==="
kubectl exec comms-svc-5f9d8d64d5-zzttg -n aivo -- nslookup nats.aivo.svc.cluster.local 2>&1

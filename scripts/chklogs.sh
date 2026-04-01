#!/bin/bash
for pod in billing-svc-77b46457c-fbz9c comms-svc-5f9d8d64d5-zzttg engagement-svc-6f6f9cff59-q29km family-svc-5568cb48d6-zcrrb learning-svc-75684fb5cb-lvlbx identity-svc-549f64bcd6-hxx9f; do
  echo "=== $pod ==="
  kubectl logs "$pod" -n aivo --tail=3 2>&1
done

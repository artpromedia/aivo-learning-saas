#!/bin/bash
echo "=== Pod Node Assignments ==="
kubectl get pods -n aivo -o custom-columns='NAME:.metadata.name,STATUS:.status.containerStatuses[0].ready,NODE:.spec.nodeName' | sort -k3

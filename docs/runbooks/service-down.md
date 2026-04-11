# Runbook: Service Down

## Symptoms
- Health check endpoint returns non-200 or times out
- Prometheus alert `ServiceDown` firing
- Status page shows service as unhealthy
- Users report feature unavailability

## Triage Steps

### 1. Identify the affected service
```bash
kubectl get pods -n aivo -l app.kubernetes.io/name=<service-name>
kubectl describe pod <pod-name> -n aivo
```

### 2. Check pod logs
```bash
kubectl logs -n aivo -l app.kubernetes.io/name=<service-name> --tail=100
kubectl logs -n aivo <pod-name> --previous  # if crash-looping
```

### 3. Check resource usage
```bash
kubectl top pod -n aivo -l app.kubernetes.io/name=<service-name>
```

## Common Causes & Fixes

### OOM Kill
- **Symptom**: `OOMKilled` in pod status
- **Fix**: Increase memory limit in Helm values (`infra/helm/values/hetzner-production.yaml`)
- **Prevention**: Review memory usage trends in Grafana service-overview dashboard

### Database connection exhaustion
- **Symptom**: Logs show `too many connections` or `connection timeout`
- **Fix**: Restart the service pod; check for connection leaks
- **Prevention**: Ensure connection pooling is configured (max 20 per service)

### NATS disconnection
- **Symptom**: Logs show `NATS connection lost`
- **Fix**: Services auto-reconnect; if persistent, check NATS cluster health
- **Note**: Services degrade gracefully without NATS — events are skipped

### Configuration error
- **Symptom**: Pod fails at startup with Zod/Pydantic validation error
- **Fix**: Check Kubernetes secrets are mounted correctly
```bash
kubectl get secret -n aivo
kubectl describe secret <secret-name> -n aivo
```

### Dependency service unavailable
- **Symptom**: Circuit breaker open, logs show timeout errors
- **Fix**: Check the upstream dependency service first
- **Note**: Circuit breakers auto-reset after 30 seconds

## Escalation
1. Check if the issue is isolated to one pod or all replicas
2. If all replicas are affected, check shared dependencies (database, NATS, Redis)
3. If rollback is needed: use the rollback GitHub Action (`.github/workflows/rollback.yml`)
4. Page on-call engineer if service is down > 15 minutes

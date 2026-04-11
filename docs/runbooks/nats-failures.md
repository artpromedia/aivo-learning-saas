# Runbook: NATS / JetStream Failures

## Symptoms
- Events not being processed (e.g., brain profile not updating after assessment)
- Dead Letter Queue (`AIVO_DLQ`) accumulating messages
- Prometheus `NATSConnectionLost` alert
- Service logs show NATS reconnection attempts

## Triage Steps

### 1. Check NATS cluster health
```bash
kubectl exec -n aivo deploy/nats -- nats server check
kubectl exec -n aivo deploy/nats -- nats server info
```

### 2. Check JetStream streams
```bash
kubectl exec -n aivo deploy/nats -- nats stream ls
kubectl exec -n aivo deploy/nats -- nats stream info AIVO_ASSESSMENT
kubectl exec -n aivo deploy/nats -- nats stream info AIVO_DLQ
```

### 3. Check consumer lag
```bash
kubectl exec -n aivo deploy/nats -- nats consumer ls AIVO_BRAIN
kubectl exec -n aivo deploy/nats -- nats consumer info AIVO_BRAIN <consumer-name>
```

## Common Causes & Fixes

### NATS server down
- **Fix**: Check NATS pod status and restart if needed
```bash
kubectl rollout restart statefulset/nats -n aivo
```
- **Note**: All services degrade gracefully — events are skipped, core functionality continues

### Consumer stuck / not processing
- **Fix**: Check consumer pending count and redeliver
```bash
kubectl exec -n aivo deploy/nats -- nats consumer info <stream> <consumer>
```
- If consumer is permanently stuck, delete and recreate it (services auto-provision on startup)

### DLQ accumulation
- **Fix**: Inspect DLQ messages to identify the root cause
```bash
kubectl exec -n aivo deploy/nats -- nats stream view AIVO_DLQ --last 10
```
- Parse the DLQ message body — it contains: `originalSubject`, `error`, `service`, `deliveryCount`
- Fix the underlying issue, then replay messages if needed

### Stream storage full
- **Fix**: Check stream bytes used vs limit
```bash
kubectl exec -n aivo deploy/nats -- nats stream info <stream-name>
```
- Purge old messages if needed: `nats stream purge <stream> --keep 1000`
- Consider increasing `max_bytes` in stream config

## Stream Configuration Reference

| Stream | Subjects | Max Age | Max Bytes |
|--------|----------|---------|-----------|
| AIVO_ASSESSMENT | aivo.assessment.> | 7 days | 500MB |
| AIVO_BRAIN | aivo.brain.> | 7 days | 500MB |
| AIVO_LEARNING | aivo.learning.> | 7 days | 500MB |
| AIVO_ENGAGEMENT | aivo.engagement.> | 7 days | 500MB |
| AIVO_DLQ | dlq.> | 30 days | 100MB |

## Impact
NATS failures are non-critical — all services continue to serve HTTP requests. Event-driven features (brain profile updates, XP grants, notification triggers) will be delayed until NATS recovers. Services automatically reconnect when NATS comes back.

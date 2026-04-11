# Resilience Matrix — AIVO Learning Platform

This document describes the fallback behavior, circuit breaker configuration, and timeout policies for each service dependency.

## Timeout Policies

| Timeout Category | Duration | Applied To |
|---|---|---|
| **Default** | 5,000ms | All standard inter-service HTTP calls |
| **Brain Service** | 10,000ms | Cognitive profile reads/writes |
| **AI Service** | 30,000ms | Content generation, tutoring responses |
| **AI Vision** | 60,000ms | IEP document parsing, homework OCR |

## Circuit Breaker Configuration

All inter-service HTTP calls are wrapped in circuit breakers using the `@aivo/resilience` package (opossum).

| Parameter | Value | Description |
|---|---|---|
| Error Threshold | 50% | Opens circuit when 50% of requests fail |
| Volume Threshold | 5 | Minimum requests before threshold evaluation |
| Reset Timeout | 30,000ms | Time before attempting a request after circuit opens |
| Rolling Window | 10,000ms | Window for calculating error percentage |

### Circuit States

- **Closed**: All requests pass through normally
- **Open**: All requests fail immediately (fast-fail) without hitting downstream
- **Half-Open**: One test request passes through; success closes circuit, failure re-opens

## Service Dependency Matrix

### identity-svc (Gateway)
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| PostgreSQL | 5s | N/A (direct DB) | None — service unavailable |
| Redis | 5s | N/A (direct cache) | Bypass rate limiting |
| NATS | N/A | N/A | Events silently dropped |
| family-svc | 5s | Yes | 503 on family endpoints |

### learning-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| brain-svc | 10s | Yes | Cached brain context (Redis) |
| ai-svc | 30s | Yes | Pre-generated content templates |
| PostgreSQL | 5s | N/A | None — service unavailable |
| NATS | N/A | N/A | Events silently dropped |

### tutor-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| brain-svc | 10s | Yes | Cached brain context |
| ai-svc (respond) | 30s | Yes | "Service busy" message to learner |
| ai-svc (vision) | 60s | Yes | Manual text input prompt |
| ai-svc (quiz) | 30s | Yes | Pre-built question bank |

### engagement-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| brain-svc | 10s | Yes | Default engagement profile |
| PostgreSQL | 5s | N/A | None — service unavailable |
| NATS | N/A | N/A | Events silently dropped |

### family-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| brain-svc | 10s | Yes | Cached brain snapshots |
| identity-svc | 5s | Yes | Read-only mode (no user creation) |
| learning-svc | 5s | Yes | Stale learning path data |
| engagement-svc | 5s | Yes | Stale gamification data |
| tutor-svc | 5s | Yes | Tutor sessions unavailable |
| S3 | 10s | N/A | Export queued for retry |

### assessment-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| ai-svc (IEP parse) | 60s | Yes | Manual IEP entry form |
| ai-svc (baseline) | 30s | Yes | Static question bank |
| S3 | 10s | N/A | Upload retry with exponential backoff |

### admin-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| brain-svc | 10s | Yes | Admin dashboard shows stale data |
| PostgreSQL | 5s | N/A | None — service unavailable |

### comms-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| OonruMail | 10s | N/A | Email queued for retry |
| Firebase FCM | 10s | N/A | Push notification dropped |
| Web Push VAPID | 5s | N/A | Notification dropped |

### billing-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| Stripe | 10s | N/A | Webhook retry (Stripe manages) |
| PostgreSQL | 5s | N/A | None — service unavailable |

### i18n-svc
| Dependency | Timeout | Circuit Breaker | Fallback |
|---|---|---|---|
| ai-svc | 30s | Yes | Cached translations |

## NATS Dead Letter Queue (DLQ)

Failed event messages are routed to a DLQ after exhausting retry attempts.

| Parameter | Value |
|---|---|
| Max delivery attempts | 5 |
| DLQ stream name | `AIVO_DLQ` |
| DLQ subject pattern | `dlq.{original_subject}` |
| DLQ retention | 30 days |
| DLQ max size | 100 MB |

### DLQ Message Format

```json
{
  "originalSubject": "brain.cloned",
  "originalData": "{...}",
  "error": "Error message",
  "failedAt": "2026-04-11T12:00:00.000Z",
  "deliveryCount": 5,
  "service": "learning-svc"
}
```

### Monitoring

DLQ messages can be inspected via NATS CLI:
```bash
nats stream info AIVO_DLQ
nats consumer ls AIVO_DLQ
nats stream view AIVO_DLQ --last 10
```

## Graceful Shutdown

All services handle `SIGTERM` via Fastify's built-in graceful shutdown:
1. Stop accepting new requests
2. Complete in-flight requests (30s timeout)
3. Drain NATS subscriptions
4. Close database connections
5. Exit cleanly

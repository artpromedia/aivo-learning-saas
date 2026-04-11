# ADR-004: NATS JetStream for Event-Driven Communication

**Status:** Accepted
**Date:** 2025-02-15
**Deciders:** Engineering team

## Context

With 15 microservices, we needed asynchronous inter-service communication for events like "brain profile updated", "assessment completed", "XP earned", etc. Requirements: at-least-once delivery, message persistence, dead letter queues, and low operational overhead.

## Decision

Use NATS 2.10 with JetStream for all inter-service event communication.

- Events defined as typed subjects in `packages/events/src/subjects.ts`
- Schemas validated via Zod in `packages/events/src/schemas/`
- JetStream streams with configurable retention, max age, and max bytes
- Dead Letter Queue (DLQ) via `AIVO_DLQ` stream — failed messages routed after 5 delivery attempts
- `publishEvent()` and `subscribeEvent()` helpers in `packages/events/`

Stream configuration:
- 7-day default retention
- File-based storage for persistence
- 500MB max per stream
- Duplicate detection window: 2 minutes

## Consequences

### Positive

- Lightweight single binary — simpler ops than Kafka or RabbitMQ
- JetStream provides persistence and replay without external dependencies
- Built-in consumer acknowledgment and redelivery
- DLQ prevents poison messages from blocking consumers
- Graceful degradation — services continue if NATS is temporarily unavailable

### Negative

- Smaller ecosystem than Kafka for analytics/streaming use cases
- JetStream consumer groups require careful configuration
- No built-in schema registry (we use Zod validation instead)

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Apache Kafka | Industry standard, massive throughput | Heavy ops, ZooKeeper dependency, overkill for our scale |
| RabbitMQ | Mature, flexible routing | More complex topology, heavier resource usage |
| Redis Streams | Already using Redis | Limited persistence guarantees, no built-in DLQ |
| AWS SQS/SNS | Managed, scalable | Vendor lock-in, higher latency, cost at scale |

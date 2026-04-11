# ADR-002: Microservices Architecture (15 Services)

**Status:** Accepted
**Date:** 2025-01-15
**Deciders:** Engineering team

## Context

AIVO Learning serves multiple domains: authentication, cognitive profiling, learning paths, AI tutoring, gamification, billing, family management, school integrations, and more. We needed an architecture that enables independent scaling, team ownership, and technology flexibility (TypeScript + Python).

## Decision

Decompose the platform into 15 domain-aligned microservices with a gateway pattern:

- **identity-svc** (port 3001): API gateway + auth (Fastify + better-auth)
- **brain-svc** (port 3002): Cognitive profiles (Python/FastAPI)
- **learning-svc** (port 3003): Learning paths, curriculum alignment
- **engagement-svc** (port 3004): XP, badges, quests
- **family-svc** (port 3005): Family management, GDPR data export/deletion
- **tutor-svc** (port 3006): AI tutor sessions
- **comms-svc** (port 3007): Email, push, in-app notifications
- **billing-svc** (port 3008): Stripe billing
- **admin-svc** (port 3009): Platform/district admin
- **integrations-svc** (port 3010): Clever, ClassLink, LTI
- **i18n-svc** (port 3011): Translation management
- **assessment-svc** (port 3012): Assessments, IEP parsing
- **research-svc** (port 3013): Research data export
- **status-page-svc** (port 3014): Health monitoring
- **ai-svc** (port 3015): LLM gateway, RAG, vision

Inter-service communication uses NATS JetStream for events and HTTP for synchronous calls (with circuit breakers via `@aivo/resilience`).

## Consequences

### Positive

- Independent deployment and scaling per service
- Technology flexibility (Python for ML-heavy services)
- Domain isolation reduces blast radius of failures
- Circuit breakers and DLQ provide resilience

### Negative

- Operational complexity: 15 services to monitor, deploy, and debug
- Distributed tracing required for cross-service debugging
- Shared PostgreSQL database creates a coupling point (mitigated by RLS)

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Monolithic backend | Simpler ops, easier debugging | No independent scaling, technology lock-in |
| Modular monolith | Best of both worlds | Still coupled deployment, harder to split later |
| Serverless functions | Auto-scaling, pay-per-use | Cold starts unacceptable for real-time tutoring |

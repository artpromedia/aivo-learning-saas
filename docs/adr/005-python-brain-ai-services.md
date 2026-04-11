# ADR-005: Python (FastAPI) for Brain and AI Services

**Status:** Accepted
**Date:** 2025-02-01
**Deciders:** Engineering team

## Context

Two services — brain-svc (cognitive profiling) and ai-svc (LLM gateway, RAG, vision) — require heavy use of ML libraries, numerical processing, and LLM SDKs. The Python ML ecosystem is significantly more mature than Node.js for these tasks.

## Decision

Implement brain-svc and ai-svc as Python/FastAPI services while keeping the remaining 13 services in TypeScript/Fastify.

- **brain-svc** (port 3002): Cognitive profile computation, curriculum resolution, mastery tracking
- **ai-svc** (port 3015): Multi-provider LLM gateway (LiteLLM), RAG pipeline, vision processing, quality gates

Key libraries:
- FastAPI + uvicorn for async HTTP
- asyncpg for PostgreSQL
- LiteLLM for unified LLM provider interface (Anthropic, OpenAI, Google)
- Pydantic for validation and settings
- Langfuse SDK for LLM observability

## Consequences

### Positive

- Access to the full Python ML ecosystem (numpy, scikit-learn, etc.)
- LiteLLM provides a unified interface across LLM providers with automatic failover
- FastAPI async model aligns well with I/O-bound LLM calls
- Pydantic settings validation consistent with TypeScript Zod patterns

### Negative

- Two runtime environments to maintain (Node.js + Python)
- Docker images for Python services are larger
- Cross-language debugging requires different tooling
- Database access uses raw asyncpg instead of Drizzle (schema not shared)

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| All TypeScript | Single runtime, shared Drizzle schema | Poor ML library support, LLM SDK gaps |
| Go for performance | Fast, small binaries | Poor ML ecosystem, harder to prototype |
| Python for all services | Consistent runtime | FastAPI less mature for gateway patterns vs Fastify |

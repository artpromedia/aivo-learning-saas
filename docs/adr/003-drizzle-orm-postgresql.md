# ADR-003: Drizzle ORM with PostgreSQL

**Status:** Accepted
**Date:** 2025-02-01
**Deciders:** Engineering team

## Context

We needed a database ORM for 13 TypeScript microservices that share a PostgreSQL database with 50+ tables. Requirements: type-safe queries, schema-as-code, migration support, and compatibility with pgvector for embeddings.

## Decision

Use Drizzle ORM with PostgreSQL 16 (with pgvector extension).

- Schema defined in `packages/db/src/schema/` (TypeScript files)
- Schema push via `drizzle-kit push` for development
- Shared database with Row Level Security (RLS) for tenant isolation
- Connection pooling via `postgres` driver (node-postgres)

## Consequences

### Positive

- Full TypeScript type safety — queries are type-checked at compile time
- Schema-as-code enables versioning and review in PRs
- Lightweight compared to Prisma (no binary engine, faster startup)
- Native SQL when needed — no ORM abstraction leaks
- pgvector support for RAG embeddings in ai-svc

### Negative

- Drizzle ecosystem is younger than Prisma — fewer community resources
- `drizzle-kit push` in development doesn't generate rollback scripts
- Shared database means schema changes require coordination across services

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Prisma | Mature ecosystem, Prisma Studio | Heavy binary, slower cold starts, less SQL control |
| TypeORM | Decorator-based, mature | Poor TypeScript inference, active record pattern |
| Knex.js | Flexible query builder | No schema type safety, manual migration management |
| Per-service databases | Full isolation | Distributed transactions, data duplication |

# ADR-001: pnpm Monorepo with Turborepo

**Status:** Accepted
**Date:** 2025-01-15
**Deciders:** Engineering team

## Context

AIVO Learning consists of a Next.js web app, a marketing site, a Flutter mobile app, 15 backend microservices, and 7 shared packages. We needed a code organization strategy that enables code sharing, consistent tooling, and independent deployability.

## Decision

Use a pnpm workspace monorepo with Turborepo for task orchestration.

- `apps/` — deployable applications (web, marketing, mobile)
- `services/` — backend microservices (13 TypeScript + 2 Python)
- `packages/` — shared libraries (db, events, brand, resilience, observability, feature-flags, security)
- `e2e/` — end-to-end tests, load tests
- `infra/` — Terraform, Helm charts, monitoring config

Turborepo manages the build dependency graph (e.g., `@aivo/brand` must build before `apps/web`).

## Consequences

### Positive

- Single repository for all code — atomic cross-package changes
- pnpm workspace protocol enables zero-publish internal dependencies
- Turborepo caching dramatically reduces CI build times
- Shared tooling (ESLint, Prettier, TypeScript configs) enforced uniformly

### Negative

- Large repository size increases clone time for new developers
- CI pipelines must be carefully scoped to affected packages to avoid rebuilding everything
- Python services (brain-svc, ai-svc) require separate dependency management (pip/uv)

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Polyrepo (separate repos per service) | Clean boundaries, independent CI | No code sharing, version coordination nightmare |
| Nx monorepo | Powerful dependency graph, plugins | Heavier tooling, steeper learning curve |
| Yarn workspaces | Mature ecosystem | Slower than pnpm, no content-addressable storage |

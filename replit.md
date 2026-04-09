# AIVO Learning SaaS

An AI-powered adaptive learning platform for children on the autism spectrum. Built as a pnpm monorepo with a Next.js web frontend and many backend microservices.

## Architecture

- **Monorepo**: pnpm workspaces with Turbo build system
- **Package Manager**: pnpm 10.6.5
- **Node.js**: v22.22.0
- **Framework**: Next.js 15.1.6 (apps/web)

### Apps
- `apps/web` — Main Next.js frontend (runs on port 5000)
- `apps/marketing` — Marketing site
- `apps/mobile` — Mobile app

### Packages (shared)
- `packages/brand` — Design tokens, brand assets (must build before web app)
- `packages/db` — Database schema (Drizzle ORM + PostgreSQL)
- `packages/events` — Event types
- `packages/feature-flags` — Feature flag utilities
- `packages/observability` — Logging/tracing utilities

### Services (microservices, Fastify/Node)
- `services/identity-svc` — Auth gateway (port 3001), uses better-auth
- `services/family-svc`, `billing-svc`, `learning-svc`, `tutor-svc`, etc.

## Running the App

The main workflow starts the Next.js web app:

```
cd apps/web && pnpm run dev
```

This runs on port 5000 at `0.0.0.0` for Replit compatibility.

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `NEXT_PUBLIC_API_URL` — URL of the identity-svc API gateway
- `AUTH_SECRET` — 32-char secret for auth sessions
- `DATABASE_URL` — PostgreSQL connection string
- Stripe keys for billing
- AI provider keys (Anthropic, OpenAI, Google)

## First-Time Setup

1. Dependencies are installed via `pnpm install`
2. Build shared packages: `pnpm --filter @aivo/brand build`
3. The web app workflow starts automatically

## Notes

- The web app requires the `@aivo/brand` package to be built before starting
- Backend microservices require a PostgreSQL database and various API keys
- The full stack uses Docker Compose in production (see `docker-compose.dev.yml`)

# Developer Onboarding Guide

Welcome to **AIVO Learning** — an AI-powered adaptive learning platform for neurodiverse children.

## Architecture Overview

AIVO is a pnpm monorepo containing:

- **2 web apps**: `apps/web` (Next.js 15 dashboard) and `apps/marketing` (marketing site)
- **1 mobile app**: `apps/mobile` (Flutter with Riverpod)
- **15 microservices**: 13 TypeScript/Fastify + 2 Python/FastAPI
- **7 shared packages**: db, events, brand, resilience, observability, feature-flags, security
- **Infrastructure**: Helm charts, Terraform, Grafana dashboards, k6 load tests

## Local Setup

### Prerequisites

- Node.js v22+ (managed by Replit or nvm)
- pnpm 10.6+ (`npm install -g pnpm`)
- PostgreSQL 16 (Replit provides one, or use Docker)
- Python 3.11+ (for brain-svc and ai-svc)
- Redis 7 (optional, graceful degradation)
- NATS 2.10 with JetStream (optional, graceful degradation)

### First-Time Setup

```bash
pnpm install

pnpm --filter @aivo/brand build
pnpm --filter @aivo/db build
pnpm --filter @aivo/events build
pnpm --filter @aivo/observability build

cd packages/db && npx drizzle-kit push --force
cd packages/db && tsx src/seed.ts
```

### Running the App

Start the Next.js frontend:
```bash
cd apps/web && pnpm run dev
```

Start identity-svc (auth gateway):
```bash
cd services/identity-svc && NODE_ENV=development tsx src/index.ts
```

Start brain-svc (Python):
```bash
cd services/brain-svc && PYTHONPATH=src python3 -m uvicorn brain_svc.main:app --host 0.0.0.0 --port 3002
```

All other services can be started via:
```bash
bash scripts/start-services.sh
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Parent | parent@test.aivo.com | password123 |
| Teacher | rivera@school.edu | password123 |
| Caregiver | jamie@email.com | password123 |
| Learner | (PIN-based) | 1234 |

## Project Structure

```
aivo-learning-saas/
├── apps/
│   ├── web/              # Next.js 15 dashboard (port 5000)
│   ├── marketing/        # Marketing site (static export)
│   └── mobile/           # Flutter app
├── services/
│   ├── identity-svc/     # Auth gateway (port 3001)
│   ├── brain-svc/        # Cognitive profiles - Python (port 3002)
│   ├── learning-svc/     # Learning paths (port 3003)
│   ├── engagement-svc/   # Gamification (port 3004)
│   ├── family-svc/       # Family management (port 3005)
│   ├── tutor-svc/        # AI tutors (port 3006)
│   ├── comms-svc/        # Notifications (port 3007)
│   ├── billing-svc/      # Stripe billing (port 3008)
│   ├── admin-svc/        # Platform admin (port 3009)
│   ├── integrations-svc/ # Clever, LTI (port 3010)
│   ├── i18n-svc/         # Translations (port 3011)
│   ├── assessment-svc/   # Assessments, IEP (port 3012)
│   ├── research-svc/     # Research data (port 3013)
│   ├── status-page-svc/  # Health monitoring (port 3014)
│   └── ai-svc/           # LLM gateway - Python (port 3015)
├── packages/
│   ├── brand/            # Design tokens
│   ├── db/               # Drizzle ORM schema
│   ├── events/           # NATS event types + DLQ
│   ├── resilience/       # Circuit breakers (opossum)
│   ├── observability/    # Logging, tracing, metrics
│   ├── feature-flags/    # Feature flag utilities
│   └── security/         # Security headers, CSRF
├── e2e/                  # Playwright E2E + k6 load tests
├── infra/                # Terraform, Helm, monitoring
└── docs/                 # ADRs, runbooks, guides
```

## Key Concepts

### API Proxy Architecture
The Next.js app proxies all API calls through `rewrites()` in `next.config.ts` to `identity-svc` (port 3001). Identity-svc then routes to the appropriate microservice. Frontend code uses relative URLs (no `NEXT_PUBLIC_API_URL`).

### Authentication
JWT RS256 tokens. Web uses HTTP-only cookies, mobile uses Bearer headers. All services verify tokens using the shared `JWT_PUBLIC_KEY`. See ADR-006.

### Event System
NATS JetStream for async inter-service events. Typed subjects and Zod-validated schemas in `packages/events/`. Failed messages go to the Dead Letter Queue after 5 attempts. See ADR-004.

### Circuit Breakers
All inter-service HTTP calls use circuit breakers (`@aivo/resilience`). Default timeout 5s, brain-svc 10s, AI calls 30s, vision 60s. See `docs/resilience-matrix.md`.

### Database
Shared PostgreSQL with Drizzle ORM. Row Level Security (RLS) for tenant isolation. Schema in `packages/db/src/schema/`.

### Internationalization
`next-intl` with ~2,050 keys across 19 namespaces. Messages in `apps/web/src/i18n/fallback-messages.json`.

## Testing

### Unit Tests
```bash
pnpm --filter <service-name> test
pnpm --filter @aivo/web test
```

### E2E Tests
```bash
cd e2e && pnpm exec playwright test --project=<project-name>
```

Projects: `module-0b-auth`, `module-1a-assessment`, `module-1b-brain`, `module-2b-tutors`, `module-3b-collaboration`, `module-4a-gamification`, `integration`, `accessibility`

### Load Tests
```bash
k6 run e2e/load/k6/auth-flow.js --env BASE_URL=http://localhost:3001
```

### Coverage
80% threshold enforced in CI for all services (Vitest v8 for TypeScript, pytest-cov for Python).

## PR Workflow

1. Create a feature branch from `master`
2. Make changes, add tests
3. Run `pnpm lint && pnpm typecheck` locally
4. Push and create a PR — CI runs build, lint, test, coverage, security scan
5. Get code review approval
6. Merge to `master` — auto-deploys to staging
7. Create a release tag — triggers production deploy with canary + approval gate

## Key Documentation

- `docs/adr/` — Architecture Decision Records
- `docs/runbooks/` — Incident response runbooks
- `docs/resilience-matrix.md` — Service fallback behaviors
- `docs/disaster-recovery-playbook.md` — DR procedures
- `docs/backup-restore-runbook.md` — Backup/restore procedures
- `docs/compliance-checklist.md` — COPPA/FERPA/GDPR compliance

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Session encryption key
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` — RSA key pair
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` — LLM providers
- `STRIPE_SECRET_KEY` — Billing
- `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` — LLM observability

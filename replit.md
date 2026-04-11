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
- `apps/mobile` — Flutter mobile app (Riverpod + GoRouter + Dio)

### Mobile App (`apps/mobile`)
Flutter app at feature parity with the web dashboard for all 4 roles:

**Architecture**: Riverpod for state, GoRouter for routing, Dio for HTTP, SecureStorage for JWT tokens

**Roles & Screens** (21 role-specific screens + shared):
- **Parent**: Dashboard, child hub, gradebook (subject mastery bars), sessions history, collaboration/care team (invite/remove members), brain profile, accommodations, IEP goals
- **Learner**: Dashboard, learning path, brain profile, quests, challenges, badges, settings
- **Teacher**: Dashboard (classroom cards with stats), classroom detail (learner list with at-risk flags), learner hub with 6 sub-screens (brain, accommodations, IEP, gradebook, sessions, family), reports, settings
- **Caregiver**: Dashboard (read-only child view), brain profile, accommodations, IEP goals, gradebook, sessions
- **Shared**: Notifications screen, login, onboarding

**Key Files**:
- `lib/config/routes.dart` — GoRouter with role-based shell routes (4 roles: learner, parent, teacher, caregiver)
- `lib/config/theme.dart` — AIVO design system (purple primary, warm backgrounds, kid-friendly)
- `lib/core/api/api_client.dart` — Dio wrapper with auth interceptor
- `lib/core/api/endpoints.dart` — Centralized API endpoint constants (identity, brain, learning, engagement, family, comms, billing, i18n, teacher, caregiver)
- `lib/shared/widgets/` — AivoCard, ErrorView, LoadingShimmer, etc.

**API Pattern**: All screens use Riverpod FutureProviders that call the centralized Endpoints constants via ApiClient; screens fall back to mock data when backend APIs are unavailable

**API Connectivity**:
- Base URL points at identity-svc root (`http://localhost:3001`); endpoints include `/api` prefix
- Family routes use root-level `/family/*` path (no `/api` prefix) matching the web app's proxy structure
- Auth uses Bearer token via Dio AuthInterceptor (JWT stored in SecureStorage)
- ApiClient supports GET, POST, PUT, PATCH, DELETE, upload, and SSE streaming
- All identity-svc proxy routes support both cookie and Bearer header auth via `getToken()` utility

### Packages (shared)
- `packages/brand` — Design tokens, brand assets (must build before web app)
- `packages/db` — Database schema (Drizzle ORM + PostgreSQL)
- `packages/events` — Event types
- `packages/feature-flags` — Feature flag utilities
- `packages/observability` — Logging/tracing utilities

### Services (15 microservices)
- `services/identity-svc` — Auth gateway (port 3001), uses better-auth
- `services/brain-svc` — Cognitive profiles (port 3002, Python/FastAPI)
- `services/learning-svc` — Learning paths, curriculum (port 3003)
- `services/engagement-svc` — XP, badges, quests (port 3004)
- `services/family-svc` — Family management (port 3005)
- `services/tutor-svc` — AI tutors (port 3006)
- `services/comms-svc` — Notifications, email, push (port 3007)
- `services/billing-svc` — Stripe billing (port 3008)
- `services/admin-svc` — Platform admin (port 3009)
- `services/integrations-svc` — LTI, Clever, webhooks (port 3010)
- `services/i18n-svc` — Translations (port 3011)
- `services/assessment-svc` — Assessments, IEP (port 3012)
- `services/research-svc` — Research data (port 3013)
- `services/status-page-svc` — Service health monitoring (port 3014)
- `services/ai-svc` — AI generation, RAG, vision (port 3015, Python/FastAPI)

## Running the App

The main workflow starts the Next.js web app:

```
cd apps/web && pnpm run dev
```

This runs on port 5000 at `0.0.0.0` for Replit compatibility.

## Design System (Playful Kid-Friendly Theme)

The frontend uses a warm, playful, colorful design system built for neurodiverse learners.

### Color Palette (CSS Variables in globals.css)
- **Primary**: `--aivo-purple-500` (#7C3AED) — main brand purple
- **Background**: `--aivo-bg` (#FFFBF7) — warm off-white
- **Card BG**: `--aivo-bg-card` (#FFF)
- **Text**: `--aivo-text` (#2D1B4E), `--aivo-text-secondary` (#6B5B7B), `--aivo-text-muted` (#A89BB5)
- **Border**: `--aivo-border` (#E8DDF0)
- **Accent colors**: coral (#FF6B6B), teal (#2DD4BF), sunny (#FBBF24), sky (#38BDF8), mint (#34D399), pink (#F472B6)

### Typography
- **Display font**: `--font-display` (Nunito) — used for headings
- **Body font**: `--font-body` (Nunito) — used everywhere
- Headings use `font-extrabold`, subheadings use `font-bold`

### Corners & Shadows
- Cards/panels: `rounded-3xl` (consistent with marketing site aesthetic)
- Buttons/inputs: `rounded-2xl`
- Icon containers: `w-12 h-12 rounded-2xl` with soft pastel backgrounds (e.g., `${color}18`)
- Shadows: `--shadow-card` (resting), `--shadow-hover` (hover), `--shadow-playful` (elevated)
- Cards use `transition-all duration-200 hover:shadow-[var(--shadow-hover)]` for consistent hover effects

### Animations (defined in globals.css)
- `animate-float` — gentle floating effect
- `animate-wiggle` — playful wiggle
- `animate-pop-in` — entrance pop
- `animate-shimmer` — skeleton loading shimmer
- `bg-bubbles` / `bg-dots` — decorative background patterns

### Key UI Components (apps/web/src/components/ui/)
- **Button** — gradient purple, rounded-2xl, scale hover, shadow
- **Card** — rounded-3xl, warm border, base + hover shadow, color accent variants
- **Badge** — colorful variants (purple, coral, teal, sunny, etc.)
- **Modal** — rounded-3xl, purple-tinted backdrop blur
- **ProgressBar** — rounded-full with gradient fill
- **Skeleton** — shimmer animation
- **Toast** — rounded-2xl with color-coded variants

### Brand Components (apps/web/src/components/brand/)
- **AivoLogo** — SVG gradient star icon + gradient text
- **PurpleGradientHeader** — teal-to-purple gradient banner with decorative circles

### Dashboard Layout
- Sidebar: `w-72`, `rounded-r-3xl`, colorful icon squares per nav item
- Main content: `lg:ml-72` with sticky top bar
- All pages use warm `--aivo-bg` background

### Shared Design System Components (`apps/web/src/components/ui/PageDesign.tsx`)
All dashboard pages use these shared design primitives for consistency:
- **PageWrapper** — Wraps all pages in a consistent container with proper spacing
- **BackLink** — Purple pill-style breadcrumb navigation (e.g., "← Back to District")
- **ExpandableCard** — Collapsible sections with gradient headers, icon, subtitle, info tooltip
- **StatCard** — Colored stat tiles with icon circles and animated entrance
- **AnimatedCard** — Wrapper for staggered `aivo-slide-up` entrance animations
- **EmptyState** — Centered empty-state display with icon, title, description, optional action
- **SectionHeader** — Section headings with divider line
- **InfoModal** — Info tooltip modals

### Page Design Pattern (Brain Profile Philosophy)
Every dashboard page follows this consistent pattern:
1. `<PageWrapper>` wrapper
2. `<BackLink>` breadcrumb pill (sub-pages)
3. `<PurpleGradientHeader>` with icon box (white/20 bg, rounded-xl) and subtitle
4. `<StatCard>` grid row for key metrics
5. `<ExpandableCard>` sections with `infoText`, gradient headers, and collapsible content
6. `<AnimatedCard>` wrappers for list items with staggered delays
7. `<EmptyState>` for zero-data cases

### CSS Keyframe Animations (globals.css)
- `aivo-slide-up` — Slide-up entrance with fade
- `aivo-pop-in` — Pop-in scale entrance
- `aivo-fade-in` — Simple fade entrance
- `aivo-float` — Gentle floating effect
- `aivo-shimmer` — Loading shimmer
- `aivo-bar-grow` — Progress bar growth
- `aivo-modal-in` — Modal entrance

### Design Patterns
- **Input fields**: `rounded-2xl border-2` with `--aivo-border`, `--aivo-bg`, `--aivo-text`
- **Error states**: `#FFE0E0` bg, `#991B1B` text, `#FECACA` border
- **Empty states**: floating icon (animate-float) in colored circle, extrabold heading
- **Stat cards**: colorful icon squares with warm backgrounds
- No `dark:` gray variants — dark mode uses warm purple tones (#2A1E45, #3D2D5C)

## API Proxy Architecture

All API calls from the frontend use **relative URLs** (no `NEXT_PUBLIC_API_URL`). The Next.js server proxies requests to identity-svc via `rewrites()` in `next.config.ts`:

- `/api/auth/*`, `/api/users/*`, `/api/learners/*`, `/api/notifications/*`, `/api/billing/*`, `/api/learning/*`, `/api/tutors/*`, `/api/shop/*`, `/api/teacher/*`, `/api/onboarding/*`, `/api/assessment/*`, `/api/family/*` → `http://localhost:3001/api/...`
- `/family/*` → `http://localhost:3001/family/*` (family-proxy, root level)
- `/assessment/*` → `http://localhost:3001/assessment/*` (assessment-proxy, root level)

The `BACKEND_URL` env var (server-side only, defaults to `http://localhost:3001`) configures the proxy target. No `NEXT_PUBLIC_*` API URL is used.

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `BACKEND_URL` — Identity-svc URL for Next.js rewrites (server-side only, default: `http://localhost:3001`)
- `AUTH_SECRET` — 32-char secret for auth sessions
- `DATABASE_URL` — PostgreSQL connection string
- Stripe keys for billing
- AI provider keys (Anthropic, OpenAI, Google)

## First-Time Setup

1. Dependencies are installed via `pnpm install`
2. Build shared packages: `pnpm --filter @aivo/brand build`
3. The web app workflow starts automatically

## Backend Microservices

All backend services run as managed workflows:

| Service | Port | Workflow | Description |
|---------|------|----------|-------------|
| identity-svc | 3001 | Identity Service | Auth gateway, API proxy |
| brain-svc | 3002 | Brain Service | Cognitive profiles (Python/FastAPI) |
| learning-svc | 3003 | Backend Services | Learning paths, curriculum |
| engagement-svc | 3004 | Backend Services | XP, badges, quests |
| family-svc | 3005 | Backend Services | Family management |
| tutor-svc | 3006 | Backend Services | AI tutors |
| comms-svc | 3007 | Backend Services | Notifications, email, push |
| billing-svc | 3008 | Backend Services | Stripe billing |
| admin-svc | 3009 | Backend Services | Platform admin |
| integrations-svc | 3010 | Backend Services | LTI, Clever, webhooks |
| i18n-svc | 3011 | Backend Services | Translations |
| assessment-svc | 3012 | Backend Services | Assessments, IEP |
| research-svc | 3013 | Backend Services | Research data |
| status-page-svc | 3014 | Backend Services | Service health monitoring |
| ai-svc | 3015 | Backend Services | AI generation, RAG (Python/FastAPI) |

### Infrastructure
- **Redis**: Port 6379 (started by Backend Services workflow)
- **NATS**: Port 4222 with JetStream (started by Backend Services workflow)
- Both services degrade gracefully if unavailable

### JSON Safety
Brain-svc uses `ensure_dict()` / `ensure_list()` from `brain_svc.utils.json_coerce` to safely handle database JSONB fields that may be stored as strings. This is applied consistently across all routes (brain, mastery, accommodations, context, tutor_registry).

## Authentication

The app uses real JWT-based authentication via identity-svc. No mock data or test login shortcuts exist.

**Test credentials**: All seed accounts use password `password123`
- Parent: `parent@test.aivo.com`
- Teacher: `rivera@school.edu`
- Caregiver: `jamie@email.com`
- Learner PIN: `1234`

**Auth flow**:
- Login via `/api/auth/login` sets `access_token` and `refresh_token` cookies
- Middleware reads JWT from `access_token` cookie to determine role for route-based access control
- AuthProvider checks session on mount via `/api/auth/session`; redirects to `/login` on failure
- Token refresh handled automatically by `apiFetch` (retries on 401)

Key files:
- `apps/web/src/lib/api.ts` — `apiFetch` with auto-refresh, no fallbacks
- `apps/web/src/providers/AuthProvider.tsx` — Session check on mount
- `apps/web/src/middleware.ts` — JWT-based role routing (reads `access_token` cookie)

## Internationalization (i18n)

The platform uses **next-intl** for all UI text across every role dashboard.

- **Messages file**: `apps/web/src/i18n/fallback-messages.json` (~2,050 keys)
- **19 namespaces**: common, auth, onboarding, landing, dashboard, assessment, brain, tutor, homework, gamification, settings, errors, email, billing, teacher, learner, platformAdmin, districtAdmin, caregiver
- **Pattern**: All dashboard pages use `useTranslations("<namespace>")` with keys for every visible string (titles, subtitles, stat labels, tooltips, empty states, section headers, etc.)
- **Namespace mapping by role**:
  - Platform Admin → `platformAdmin` (121 keys)
  - District Admin → `districtAdmin` (196 keys)
  - Teacher → `teacher` (266 keys) + `dashboard`, `settings`
  - Parent → `dashboard` (430 keys) + `settings`
  - Caregiver → `caregiver` (87 keys)
  - Learner → `learner`, `brain`, `gamification`, `settings`, `dashboard`
- **Landing/Get-Started/Auth**: `landing` (51 keys) + `auth` — landing page, registration, login, forgot password
- **Adding new keys**: Add to the appropriate namespace in `fallback-messages.json`, then use `t("keyName")` in the component
- **Shared layout**: The dashboard layout (`apps/web/src/app/(dashboard)/layout.tsx`) uses `dashboard` namespace for sidebar nav labels

## Database & Seed Data

The Replit PostgreSQL database is provisioned via `DATABASE_URL`. Schema is managed by Drizzle ORM (`packages/db`).

### Schema Push
```bash
cd packages/db && npx drizzle-kit push --force
```

### Seed Script
```bash
cd packages/db && tsx src/seed.ts
```

Seeds the database with data matching the frontend mock data:
- **Tenant**: Johnson Family (B2C_FAMILY)
- **Parent**: Sarah Johnson (`parent@test.aivo.com`)
- **Learners**: Alex Johnson (SUPPORTED, Grade 5), Maya Johnson (STANDARD, Grade 3)
- **Teacher**: Ms. Rivera (`rivera@school.edu`)
- **Caregiver**: Jamie Rodriguez (`jamie@email.com`)
- **Brain States**: Full cognitive profile for Alex (visual-spatial learner), basic profile for Maya
- **Assessments**: Parent assessment + baseline assessment with 10 items for Alex
- **IEP**: 2 documents + 3 goals for Alex
- **Recommendations**: 3 recommendations (curriculum, tutor, accommodation)
- **Engagement**: XP, 6 badges (4 earned), 4 quests (2 active), 5 XP events
- **Billing**: Active subscription (family_plus plan)
- **Notifications**: 3 notifications for parent
- **School Districts**: 4 districts (LAUSD/CA, Houston ISD/TX, NYC DOE/NY, Miami-Dade/FL) with zip codes and curriculum standards
- **District Curriculum Standards**: MATH + ELA per grade band per district (COMMON_CORE, TEKS, NYSLS, BEST)

Seed IDs use deterministic UUIDs (e.g., `c0000000-0000-4000-8000-000000000001` for Alex learner).
District IDs: `40000000-0000-4000-8000-000000000001` (LAUSD) through `...000004` (Miami-Dade).

## Location-Based Curriculum Selection

Learners can optionally have a state + zip code which auto-resolves to a school district. Each district has a curriculum framework (COMMON_CORE, TEKS, NYSLS, BEST, etc.) and grade-banded curriculum standards (MATH, ELA).

### API Endpoints
- `GET /api/districts/lookup?zip=XXXXX` — Lookup district by zip (returns district + curriculum standards)
- `GET /api/districts/lookup?state=XX` — List districts by state

### Schema Tables
- `school_districts` — District metadata (name, state, NCES ID, curriculum framework)
- `district_zip_codes` — Maps zip codes to districts
- `district_curriculum_standards` — Subject/grade-band standards per district

### Brain-svc Curriculum Resolution
- `resolve_seed_for_learner(grade, level, curriculum_framework?)` now accepts an optional `curriculum_framework` parameter
- When set (e.g. `COMMON_CORE`, `TEKS`, `NYSLS`, `BEST`, `NGSS`), `active_curriculum` is sourced from district-specific skill maps per grade band
- Falls back to default alignment when framework is unknown or omitted
- `clone_brain()` and event subscriber pass `curriculum_framework` through the pipeline

### Learning-svc Curriculum Integration
- `BrainContext` includes `curriculumFramework` and `curriculumAlignment` fields
- `buildGapActivities()` prioritizes skills that match the learner's district curriculum
- Gap activities tagged `curriculum_aligned_gap` when skill matches district standards
- `DailyLearningPath` includes `curriculumFramework` in response

### Frontend Integration
- Add-child onboarding form includes optional state/zip with auto district detection
- Parent learner dashboard shows district name and curriculum framework badge in header

## Identity Service (Backend)

The identity-svc runs as a Fastify API gateway on port 3001 with a dedicated workflow.

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection (auto-set by Replit)
- `AUTH_SECRET` — 32+ char secret for auth
- `JWT_PRIVATE_KEY` — RSA private key (PKCS8 PEM)
- `JWT_PUBLIC_KEY` — RSA public key (SPKI PEM)
- `NATS_URL` — NATS server URL (gracefully degrades in dev if unavailable)
- `REDIS_URL` — Redis URL (defaults to localhost, not actively used yet)

### Building Dependencies
Before identity-svc can start, workspace packages must be built:
```bash
pnpm --filter @aivo/db build
pnpm --filter @aivo/events build
pnpm --filter @aivo/observability build
```

### Workflow
The "Identity Service" workflow runs `cd services/identity-svc && NODE_ENV=development tsx src/index.ts` on port 3001.

## Deployment

Configured for **autoscale** deployment:
- **Build**: `cd services/identity-svc && npx tsup --no-dts && cd ../.. && cd apps/web && pnpm run build`
- **Run**: `bash start.sh` (starts identity-svc + Next.js in parallel)
- **start.sh**: Launches identity-svc (port 3001) and Next.js (port 5000) as background processes

## API Documentation (OpenAPI/Swagger)

All 15 services expose interactive API documentation:
- **TypeScript services** (13): `@fastify/swagger` + `@fastify/swagger-ui` at `/docs` on each service port
- **Python services** (2): FastAPI built-in `/docs` (Swagger UI) and `/redoc`
- **OpenAPI JSON**: Available at `/docs/json` on each TypeScript service, `/openapi.json` on Python services
- Example: Identity service docs at `http://localhost:3001/docs`

## Code Coverage

- **TypeScript**: Vitest with `v8` provider, 80% threshold (lines, functions, branches, statements) across all 19 configs
- **Python**: pytest-cov with 80% threshold for brain-svc and ai-svc
- Run coverage: `pnpm test:coverage` (per service) or `pnpm test:all -- --coverage` (all)

## Disaster Recovery

- **DR Playbook**: `docs/disaster-recovery-playbook.md` — RTO < 4h, RPO < 1h
- **Backup Runbook**: `docs/backup-restore-runbook.md` — PostgreSQL/Redis backup & restore procedures
- **Backup Test Script**: `scripts/test-backup-restore.sh` — Automated backup restore verification

## Notes

- The web app requires the `@aivo/brand` package to be built before starting
- Backend microservices require a PostgreSQL database and various API keys
- The full stack uses Docker Compose in production (see `docker-compose.dev.yml`)
- NATS plugin in identity-svc gracefully degrades in dev mode (events silently skipped)
- `publishEvent()` in `@aivo/events` accepts null NATS connection (no-op when null)

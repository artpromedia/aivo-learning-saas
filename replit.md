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
- Cards/panels: `rounded-2xl` (default), `rounded-3xl` (hero/modals)
- Buttons/inputs: `rounded-2xl`
- Shadows: `--shadow-card`, `--shadow-playful`, `--shadow-hover` (purple-tinted)

### Animations (defined in globals.css)
- `animate-float` — gentle floating effect
- `animate-wiggle` — playful wiggle
- `animate-pop-in` — entrance pop
- `animate-shimmer` — skeleton loading shimmer
- `bg-bubbles` / `bg-dots` — decorative background patterns

### Key UI Components (apps/web/src/components/ui/)
- **Button** — gradient purple, rounded-2xl, scale hover, shadow
- **Card** — rounded-2xl, warm border, playful shadow, color accent variants
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

## Test Login & Mock Data

In dev mode, the login page has "Test Accounts" buttons (Parent, Learner, Teacher, Admin, Caregiver) that set a `user_role` cookie via `/api/test-login?role=<role>` and redirect to the dashboard.

When the backend APIs aren't running, the app falls back to **mock data** (`apps/web/src/lib/mock-data.ts`) for all dashboard pages. This includes:
- Parent dashboard with 2 mock learners (Alex & Maya Johnson)
- Learner profiles with brain data, gradebook, IEP, quests, tutors, badges, challenges
- Teacher classrooms with learner data (6+ learners with mastery, at-risk flags, functioning levels), sortable tables, learner brain view with subjects/accommodations/IEP goals/sessions
- Teacher learner hub (matching parent child hub design) with Quick Navigation grid, StatCards, sub-pages (brain, accommodations, iep, gradebook, sessions), Reports page, Settings page
- Caregiver dashboard with read-only child view (brain profile, accommodations, IEP, gradebook, sessions)
- Admin district overview with teachers, classrooms, licenses
- Notifications, engagement stats, shop items, collaboration members
- Caregiver invite system (max 2 per child) on parent collaboration page with copy invite link
- Caregiver onboarding wizard at `/accept-invite` (public route, no auth required): welcome → set PIN → review → complete
- Bidirectional parent/teacher invite system:
  - Parent-paid subscription: parent can invite teacher from collaboration page
  - District-paid subscription: teacher can invite parent from `/teacher/learners/[id]/family`
  - Subscription type returned by collaboration API (`subscriptionType: "parent" | "district"`)
  - Teacher family page shows "Invite Parent" form with district context; parent collaboration page shows "Invite Teacher" form with parent context

The mock system activates when:
1. A `user_role` cookie is present (test login)
2. The backend API call fails (connection refused or 401)

Mock data covers all learner pages including:
- **Learning path activities** — 4 activities (lesson, quest, practice, homework) for "Today's Learning Path"
- **Quest worlds** — 4 worlds with chapters (Ocean Explorer, Space Adventure, Jungle Safari, Ancient Egypt)
- **Tutor chat** — Mock session start (POST) and simulated streaming chat with per-persona responses for all 7 tutors (nova, sage, spark, chrono, pixel, harmony, echo)
- **Challenges** — 4 challenges (1v1, team, global) with proper participants/duration data
- **Shop items** — 8 avatar customization items with AI-generated images (`/assets/shop/*.png`) and rarity tiers (common/rare/epic/legendary); `ShopItemImage` component handles image load failures with emoji fallbacks
- **Homework** — 3 assignments with proper status codes (READY/IN_PROGRESS/COMPLETED)
- **Badges, Profile, Settings** — Full engagement/XP/streak/level data; avatar upload works in mock mode using data URIs (persists across reloads)

Learner PIN: `1234` — handled in `getMockResponse` with body parsing

Key files:
- `apps/web/src/lib/mock-data.ts` — All mock responses + `getMockTutorResponse()` for chat
- `apps/web/src/lib/api.ts` — `apiFetch` with mock fallback
- `apps/web/src/providers/AuthProvider.tsx` — Test user hydration + learner store population
- `apps/web/src/stores/auth.store.ts` — `hydrateTestUser()` function
- `apps/web/src/app/api/test-login/route.ts` — Server-side test login route

## Notes

- The web app requires the `@aivo/brand` package to be built before starting
- Backend microservices require a PostgreSQL database and various API keys
- The full stack uses Docker Compose in production (see `docker-compose.dev.yml`)

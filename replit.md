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

## Notes

- The web app requires the `@aivo/brand` package to be built before starting
- Backend microservices require a PostgreSQL database and various API keys
- The full stack uses Docker Compose in production (see `docker-compose.dev.yml`)

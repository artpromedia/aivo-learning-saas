# AIVO AI Learning Platform v3

## Overview
AI-powered adaptive learning platform for neurodiverse children. Features Brain-Clone architecture, 14 AI tutors, 5 functioning levels, and sensory profiles engine.

## Architecture

### Monorepo Structure (Turborepo + pnpm)
```
apps/web           — Next.js 15 frontend (port 5000)
packages/db        — Drizzle ORM schema (PostgreSQL 16)
packages/brand     — Design tokens, tutor catalog, roles
packages/events    — Typed NATS event definitions
packages/observability — Pino structured logging
packages/security  — JWT RS256 sign/verify (jose)
services/identity-svc  — Fastify auth service (port 3001)
services/assessment-svc — Fastify assessment API (port 3003)
services/brain-svc     — Python FastAPI brain clone (port 3002)
services/ai-svc        — Python FastAPI LLM gateway (port 3004)
services/learning-svc  — Fastify lesson sessions (port 3005)
services/tutor-svc     — Fastify tutor management (port 3006)
services/family-svc    — Fastify family collaboration + IEP (port 3007)
```

### Tech Stack
- **Frontend**: Next.js 15 + Tailwind CSS v4 + TypeScript
- **Backend (TS)**: Fastify 5 + Drizzle ORM + PostgreSQL 16
- **Backend (Python)**: FastAPI + LiteLLM + Uvicorn
- **Auth**: JWT RS256 (jose library), refresh tokens, PIN login
- **Database**: PostgreSQL 16 with JSONB brain states
- **Styling**: AIVO brand system (purple primary #7C3AED), game-themed Fredoka + Nunito fonts

### Key Concepts
- **14 Tutors**: 7 core (Nova/Math, Sage/ELA, Spark/Science, Chrono/History, Pixel/Coding, Echo/Speech, Harmony/SEL) + 7 expansion (Atlas/Geography, Cadence/Music, Vigor/PE, Lingua/Languages, Forge/Vocational, Compass/Life Skills, Muse/Art)
- **Tutor Avatars**: AI-generated photorealistic portraits in `apps/web/public/images/tutors/` (14 PNG files, 3:4 aspect ratio)
- **Parallax Tutor Carousel**: Landing page features auto-rotating parallax carousel with depth-stacked cards, center detail panel, and pause/play control
- **5 Functioning Levels**: STANDARD → SUPPORTED → LOW_VERBAL → NON_VERBAL → PRE_SYMBOLIC
- **7 Roles**: PARENT, LEARNER, TEACHER, CAREGIVER, THERAPIST, DISTRICT_ADMIN, PLATFORM_ADMIN
- **Brain Clone**: Assessment → Level routing → Brain state creation → Versioned snapshots → Rollback

### Running Services
1. **Start application** (port 5000): Next.js frontend
2. **Identity Service** (ports 3001, 3003, 3005, 3006, 3007): Identity + Assessment + Learning + Tutor + Family services
3. **Brain Service** (port 3002): Python FastAPI brain-svc
4. **ai-svc** (port 3004): Python FastAPI LLM gateway (start separately)

### Database
- Schema managed by Drizzle ORM in `packages/db/src/schema/`
- Migrations in `packages/db/drizzle/`
- Seed: `pnpm --filter @aivo/db exec tsx src/seed.ts`

### API Routes (proxied via Next.js rewrites)
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Email login
- `POST /api/auth/pin-login` — Learner PIN login
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/users/me` — Current user profile
- `GET /api/users/learners` — List learners
- `POST /api/users/learners` — Create learner (with COPPA consent + curriculum auto-detection)
- `GET /api/curriculum/lookup?zipCode=&country=` — Lookup curriculum by zip/country
- `POST /api/assessments/parent` — Parent assessment → functioning level (49 questions, 11 categories)
- `POST /api/brain/clone` — Clone brain state
- `GET /api/brain/:learnerId` — Get brain state
- `POST /api/brain/:learnerId/rollback` — Rollback to snapshot
- `POST /api/ai/generate` — Generate lesson/practice content via LLM
- `POST /api/ai/tutor/chat` — Tutor chat completion
- `POST /api/ai/generate-baseline` — Generate personalized baseline questions from parent assessment
- `GET /api/assessments/learner/baseline/:learnerId` — Fetch AI-generated baseline questions for learner
- `POST /api/learning/sessions` — Start lesson session
- `POST /api/learning/sessions/:id/complete` — Complete session + mastery write-back
- `GET /api/learning/gradebook/:learnerId` — Gradebook entries
- `GET /api/learning/path/:learnerId/:subject` — Learning path
- `GET /api/tutors/catalog` — Tutor catalog with bundles
- `POST /api/tutors/subscribe` — Subscribe to individual tutor
- `POST /api/tutors/subscribe-bundle` — Subscribe to tutor bundle
- `POST /api/tutor/session/start` — Start tutor chat session
- `POST /api/tutor/session/:id/message` — Send message in tutor chat
- `POST /api/tutor/session/:id/complete` — Complete tutor session
- `POST /api/tutors/homework/upload` — Upload homework (image OCR or text)
- `GET /api/tutors/homework/learner/:learnerId` — List assignments
- `GET /api/tutors/homework/:assignmentId` — Get assignment detail
- `POST /api/tutors/homework/session/start` — Start homework help session
- `POST /api/tutors/homework/session/:id/message` — Chat in homework session
- `POST /api/tutors/homework/session/:id/complete` — Complete homework session
- `POST /api/ai/homework/ocr` — OCR processing (ai-svc)
- `POST /api/ai/homework/adapt` — Adapt problems to functioning level (ai-svc)
- `POST /api/ai/homework/chat` — Homework chat completion (ai-svc)

### Frontend Pages
- `/` — Landing page (parallax tutor carousel)
- `/login` — Email login + Learner PIN login
- `/register` — Parent registration
- `/dashboard/parent` — Parent dashboard (learner cards, store link)
- `/dashboard/parent/store` — Tutor Store (bundles + individual subscribe)
- `/dashboard/parent/learner/[id]/assessment` — Parent Baseline Assessment (49 questions, 11 categories)
- `/dashboard/parent/learner/[id]/gradebook` — Gradebook (mastery bars, sessions, XP)
- `/dashboard/learner` — Learner dashboard (tutor grid + homework helper link)
- `/dashboard/learner/assessment` — Learner Baseline Assessment (dynamically generated from parent assessment via AI, fallback to 42 hardcoded questions across 7 subjects)
- `/dashboard/learner/lesson/[tutorKey]` — Lesson Chat UI
- `/dashboard/learner/homework` — Homework Helper (upload photo/paste text, assignment list)
- `/dashboard/learner/homework/[sessionId]` — Homework Help Session (Socratic chat + problem sidebar)
- `/dashboard/parent/[learnerId]/homework` — Parent Homework History (view child's homework activity)
- `/dashboard/parent/learner/[id]/collaboration` — Learning Team (invite teacher/caregiver/therapist)
- `/dashboard/parent/learner/[id]/recommendations` — Recommendation Inbox (approve/decline/adjust Brain recommendations)
- `/dashboard/parent/learner/[id]/iep` — IEP Goal Tracking (progress bars, trends, report generation)

### GitHub Repository
- **New repo**: `artpromedia/aivo-ai-learning` (pushed Phase 0+1 — 125 files, 17,627 lines)
- **Branch**: `main`

### Security
- Argon2id password hashing (via `argon2` npm package)
- Refresh tokens stored as SHA-256 hashes in DB
- PIN login scoped to parent's own learners only
- Consent revocation requires ownership verification
- Unique email constraint on users table

### Environment
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` — RS256 key pair (in .replit userenv)
- `NEWBUILD` — GitHub PAT for artpromedia/aivo-ai-learning repo

# AIVO Learning — Enterprise Sales Enablement Package

## Platform Overview

**AIVO Learning** is an AI-powered adaptive learning platform purpose-built for neurodiverse learners, particularly children on the autism spectrum. The platform combines cognitive profiling, AI-driven tutoring, and curriculum-aligned content generation to deliver truly personalized education.

## Key Differentiators

### 1. Brain-Powered Personalization
Every learner gets a cognitive profile ("Brain") that captures visual-spatial preferences, sensory profiles, and processing strengths. All content, tutoring, and gamification adapts in real time to each child's unique profile.

### 2. Curriculum Alignment
Content automatically aligns to district-specific curriculum frameworks — Common Core, TEKS, NYSLS, BEST, and more. Dynamic district lookup uses the learner's zip code to resolve the correct standards.

### 3. IEP Integration
Upload IEP documents and the platform's vision AI extracts structured goals. Progress tracking maps directly to IEP objectives with accommodation management.

### 4. Multi-Role Collaboration
Parents, teachers, caregivers, and administrators each get role-specific dashboards with FERPA-compliant data separation. Parents maintain control over their child's cognitive profile.

## Enterprise Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TailwindCSS 4 |
| Mobile | Flutter (iOS + Android) |
| Backend | 15 microservices (TypeScript + Python) |
| Database | PostgreSQL 16 with pgvector |
| AI/ML | Multi-model (Claude, Gemini, GPT-4o) with automatic fallback |
| Infrastructure | Kubernetes (K3s), Helm, Terraform |

### Microservices Architecture

15 independently deployable services covering identity, brain profiling, learning paths, engagement, family management, AI tutoring, billing, communications, integrations, i18n, assessment, research, status monitoring, and AI orchestration.

## Compliance & Security

### Regulatory Compliance

| Regulation | Status | Key Controls |
|------------|--------|-------------|
| **COPPA** | Implemented | Parent consent flow with versioning, data minimization, no behavioral advertising |
| **FERPA** | Implemented | Teacher read-only access, parent approval gates, audit logging, school-as-agent model |
| **GDPR** | Implemented | Right to erasure, data portability, consent management |
| **SOC 2 Type II** | In preparation | Control matrix mapped, evidence collection automated |

### Security Controls

- **Authentication**: JWT RS256, OAuth (Google/Apple), PIN-based learner auth
- **Authorization**: Role-based access control (6 roles), PostgreSQL Row-Level Security on 20+ tables
- **Data Protection**: AES-256 encryption at rest, TLS in transit
- **API Security**: Rate limiting (Redis-backed), CSRF protection, input validation (Zod/Pydantic)
- **AI Security**: Prompt injection prevention, PII redaction in LLM traces
- **Vulnerability Management**: Automated scanning (Trivy, npm audit, pip audit), secret scanning (Gitleaks), SBOM generation (CycloneDX)
- **Monitoring**: Prometheus + Grafana (5 dashboards), Alertmanager, Sentry, OpenTelemetry

### SOC 2 Trust Services Criteria Coverage

| Criteria | Coverage |
|----------|----------|
| Security (CC1-CC9) | 85% — access controls, change management, monitoring |
| Availability (A1) | 75% — multi-region replication, DR playbook, backup verification |
| Processing Integrity (PI1) | 90% — input validation, automated testing |
| Confidentiality (C1) | 85% — encryption, RLS, access controls |
| Privacy (P1) | 90% — COPPA/FERPA/GDPR implemented |

## Deployment & Operations

### Infrastructure

| Component | Details |
|-----------|---------|
| Primary Region | Hetzner Cloud HEL1 (Helsinki) — 4 dedicated servers |
| Secondary Region | Hetzner Cloud FSN1 (Falkenstein) — hot standby |
| Database | PostgreSQL 16 with streaming replication |
| Container Orchestration | K3s (Kubernetes) with Helm charts |
| IaC | Terraform (version-controlled) |
| CI/CD | GitHub Actions (11+ workflows) |

### Deployment Strategy

- **Progressive Delivery**: Flagger + Istio for blue-green deployments
- **Traffic Shifting**: 10% → 50% → 100% with automatic rollback on metric degradation
- **Canary Analysis**: Request success rate > 99%, p95 latency < 500ms
- **Rollback**: Automated on failed metrics, manual one-click rollback available

### Reliability Targets

| Metric | Target |
|--------|--------|
| Platform Uptime | 99.9% (< 8.7h downtime/year) |
| API Response Time (p95) | < 200ms |
| Recovery Time Objective (RTO) | < 4 hours |
| Recovery Point Objective (RPO) | < 1 hour |
| Mean Time to Recovery (MTTR) | < 30 minutes |

## Testing & Quality

| Testing Layer | Coverage |
|--------------|----------|
| Unit Tests (TypeScript) | 91 test files (Vitest), 80% coverage threshold |
| Unit Tests (Python) | 37 test files (Pytest), 80% coverage threshold |
| E2E Tests | 40+ Playwright specs (auth → enterprise → integration) |
| Accessibility | axe-core (WCAG 2.1 AA) on all routes |
| Visual Regression | Argos CI automated in CI |
| Load Testing | k6 with p95 < 200ms threshold enforcement |
| Mutation Testing | Stryker.js on critical paths (auth, billing, RLS) |
| Security Scanning | Trivy + npm audit + pip audit + Gitleaks + CycloneDX SBOM |

## Integration Capabilities

### SSO & Identity
- Clever SSO (school districts)
- ClassLink SSO (school districts)
- Google OAuth
- Apple OAuth

### LMS Interoperability
- LTI 1.3 for LMS integration (Canvas, Schoology, Google Classroom)

### Billing
- Stripe subscriptions with per-seat pricing
- AI tutor add-ons (individual or bundle)

### Data Standards
- OpenAPI 3.1 specifications for all 15 services
- NATS event-driven messaging with typed contracts
- GDPR Article 20 data portability (ZIP export)

## Pricing Models

| Model | Description |
|-------|-------------|
| B2C (Families) | Starter / Family / Premium tiers + AI tutor add-ons |
| B2B (Schools) | Per-seat licensing with district-wide management |
| Enterprise | Custom pricing with dedicated support, SLAs, DPA |

## Contact

For enterprise inquiries, pilot programs, or procurement documentation, contact the AIVO Learning sales team.

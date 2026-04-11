# SOC 2 Type II Control Matrix — AIVO Learning Platform

## Trust Services Criteria Mapping

### CC1 — Control Environment

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC1.1 | Board/Management oversight of security | Security policies documented, quarterly review cycle | `docs/compliance/`, ADRs |
| CC1.2 | Organizational structure | Defined roles (Parent, Teacher, Caregiver, Admin, District Admin) with RBAC | `packages/db/src/schema/enums.ts` |
| CC1.3 | Authority and responsibility | Service ownership documented per microservice | `docs/onboarding.md` |
| CC1.4 | Competence of personnel | Developer onboarding guide, code review process | `docs/onboarding.md`, PR templates |
| CC1.5 | Accountability | Audit logging on all data mutations | `audit_events` table, `@aivo/observability` |

### CC2 — Communication and Information

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC2.1 | Internal communication of security policies | Developer onboarding guide, ADRs | `docs/onboarding.md`, `docs/adr/` |
| CC2.2 | External communication | Privacy policy, terms of service, DPA | Marketing site, `docs/compliance/` |
| CC2.3 | Reporting channels | Sentry error tracking, Grafana dashboards, Alertmanager | `infra/monitoring/` |

### CC3 — Risk Assessment

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC3.1 | Risk identification | Enterprise gap analysis, 14-area audit | PRD v2.0 §14 |
| CC3.2 | Risk analysis | Prioritized remediation roadmap (4 phases) | PRD v2.0 §15 |
| CC3.3 | Fraud risk assessment | Rate limiting, CSRF protection, prompt injection prevention | `@aivo/security`, `prompt_sanitizer.py` |
| CC3.4 | Change management risk | CI/CD with automated testing, canary deployments | `.github/workflows/` |

### CC4 — Monitoring Activities

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC4.1 | Ongoing monitoring | Prometheus metrics, Grafana dashboards (5), Alertmanager | `infra/monitoring/` |
| CC4.2 | Deficiency evaluation | Sentry error tracking with PII filtering | `@aivo/observability` |
| CC4.3 | Remediation tracking | GitHub Issues, enterprise remediation roadmap | `.github/`, PRD |

### CC5 — Control Activities

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC5.1 | Logical access controls | JWT RS256 auth, RLS tenant isolation, RBAC middleware | `identity-svc`, RLS policies |
| CC5.2 | Infrastructure security | Helm charts, Terraform IaC, security headers | `infra/helm/`, `infra/terraform/` |
| CC5.3 | Change management | CI/CD pipelines, PR reviews, automated testing | `.github/workflows/ci.yml` |

### CC6 — Logical and Physical Access

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC6.1 | Access provisioning | Role-based access (6 roles), tenant isolation | Schema enums, RLS policies |
| CC6.2 | Access revocation | Session management, token expiration, account deletion | `identity-svc` |
| CC6.3 | Authentication | JWT RS256, PIN-based learner auth, OAuth (Google/Apple) | `identity-svc` |
| CC6.4 | MFA | Available for admin accounts | `identity-svc` |
| CC6.5 | Physical access | Hetzner Cloud managed infrastructure | Hetzner compliance docs |
| CC6.6 | Access review | Audit log for all auth events | `audit_events` table |

### CC7 — System Operations

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC7.1 | Infrastructure monitoring | Prometheus + Grafana + Alertmanager | `infra/monitoring/` |
| CC7.2 | Incident detection | Sentry alerts, health check polling (status-page-svc) | `status-page-svc` |
| CC7.3 | Incident response | Incident runbooks, escalation procedures | `docs/runbooks/` |
| CC7.4 | Recovery procedures | DR playbook, automated backups, Helm atomic rollback | `docs/`, `infra/backup-agent/` |
| CC7.5 | Change detection | Gitleaks secret scanning, vulnerability scanning | `.github/workflows/` |

### CC8 — Change Management

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC8.1 | Change authorization | PR reviews, CI gates, production approval environment | `.github/workflows/deploy-production.yml` |
| CC8.2 | Testing changes | 16,681+ lines of test code, E2E + unit + accessibility | `e2e/`, `tests/`, `__tests__/` |
| CC8.3 | Emergency changes | Rollback workflow, atomic Helm upgrades | `.github/workflows/rollback.yml` |

### CC9 — Risk Mitigation

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| CC9.1 | Business continuity | DR playbook, streaming replication, multi-region | `docs/runbooks/`, `infra/terraform/` |
| CC9.2 | Data backup | Automated pg_dump + Redis RDB → S3, 30-day retention | `infra/backup-agent/` |

### A1 — Availability

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| A1.1 | Capacity planning | Per-tenant resource quotas, rate limiting | `tenant_configs` table |
| A1.2 | Environmental protections | Hetzner Cloud managed infrastructure | Hetzner SLA |
| A1.3 | Recovery operations | Failover procedures, streaming replication | `docs/runbooks/database-failover.md` |

### C1 — Confidentiality

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| C1.1 | Data classification | PII categories defined, Sentry PII filtering | `@aivo/observability` |
| C1.2 | Data disposal | GDPR Article 17 cascading erasure | `family-svc` data deletion |
| C1.3 | Encryption | AES-256 at rest (PostgreSQL + S3), TLS in transit | Infrastructure config |

### PI1 — Processing Integrity

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| PI1.1 | Input validation | Zod schemas (TS), Pydantic (Python) on all endpoints | All services |
| PI1.2 | Processing accuracy | Automated testing, E2E verification | Test suites |
| PI1.3 | Output completeness | API response schemas, typed NATS events | `@aivo/events` |

### P1 — Privacy

| Control ID | Description | AIVO Implementation | Evidence |
|-----------|-------------|---------------------|----------|
| P1.1 | Privacy notice | Privacy policy on marketing site | Marketing app |
| P1.2 | Consent management | COPPA consent flow with versioning | `identity-svc` |
| P1.3 | Data minimization | Minimal data collection, purpose limitation | Schema design |
| P1.4 | Data portability | GDPR Article 20 ZIP export (JSON + Markdown) | `family-svc` |
| P1.5 | Right to erasure | GDPR Article 17 cascading delete | `family-svc` |
| P1.6 | Data breach notification | 72-hour GDPR notification procedure | `docs/compliance/data-breach-procedure.md` |

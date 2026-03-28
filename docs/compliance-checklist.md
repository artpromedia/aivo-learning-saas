# AIVO Compliance Checklist — COPPA / FERPA / GDPR

## COPPA (Children's Online Privacy Protection Act)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| No under-13 data without parental consent | ✅ | Parent account required for all learner creation |
| Parent owns all Brain data | ✅ | Parent is sole data controller; all exports/deletions go through parent |
| Verifiable parental consent | ✅ | `consent_records` table tracks consent with type, version, timestamp, IP |
| Parent can review child's data | ✅ | Data export (Article 20 compliant) via parent settings |
| Parent can delete child's data | ✅ | Full GDPR Article 17 erasure pipeline |
| No behavioral advertising to children | ✅ | Plausible cookieless analytics only; no ad tracking |
| Data minimization | ✅ | Only educational data collected; no social/behavioral profiling |

## FERPA (Family Educational Rights and Privacy Act)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| School official access is read-only on Brain | ✅ | Teacher role has read-only Brain access |
| District admin cannot override parent Brain approval | ✅ | Parent-only approval gates on recommendations |
| Directory information opt-out | ✅ | Privacy settings per learner (standard/strict modes) |
| Audit log for educational record access | ✅ | `audit_events` table logs all data access |
| School official consent flow for B2B | ✅ | B2B enrollment uses school-as-agent-of-parent model |
| Annual FERPA notification | ⬜ | Template needed in comms-svc |

## GDPR (General Data Protection Regulation)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Right to erasure (Article 17) | ✅ | `data_lifecycle.py` cascading deletion pipeline |
| Right to data portability (Article 20) | ✅ | `data_export.py` ZIP export with JSON + Markdown |
| Lawful basis for processing | ✅ | Consent-based for B2C; legitimate interest + DPA for B2B |
| Data Processing Agreement for B2B | ✅ | DPA acceptance tracked in `consent_records` |
| EU data residency | ✅ | `data_residency.py` tenant-level routing config |
| Consent management with versioning | ✅ | `consent_records` table with type, version, timestamp |
| Right to rectification | ✅ | Parent can update all learner profile data |
| Data breach notification (72 hours) | ⬜ | Incident response plan needed |
| Privacy impact assessment | ⬜ | Documentation needed |
| Cookie consent | ✅ | CookieBanner component; Plausible is cookieless |

## Technical Controls

| Control | Status | Implementation |
|---------|--------|----------------|
| PostgreSQL RLS tenant isolation | ✅ | `0001_rls_policies.sql` on all tenant-scoped tables |
| LLM prompt injection prevention | ✅ | `prompt_sanitizer.py` with pattern detection |
| Security headers (HSTS, CSP, etc.) | ✅ | `@aivo/security` headers plugin |
| CSRF protection | ✅ | Double-submit cookie pattern |
| API rate limiting | ✅ | Redis-backed tiered rate limits |
| Audit logging | ✅ | Append-only `audit_events` table |
| Encryption at rest | ✅ | PostgreSQL + S3 AES-256 encryption |
| JWT RSA-signed tokens | ✅ | RS256 public/private key pair |
| Dependency vulnerability scanning | ✅ | npm audit + pip audit + Trivy in CI |
| Secret scanning | ✅ | TruffleHog in CI pipeline |

# Privacy Impact Assessment (PIA) Template

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | AIVO Learning Platform |
| **Assessment Date** | 2026-04-11 |
| **Assessor** | Security & Compliance Team |
| **Review Cycle** | Annual or upon significant system change |

## 2. Data Processing Activities

### 2.1 Personal Data Inventory

| Data Category | Data Elements | Subjects | Lawful Basis | Retention |
|--------------|---------------|----------|--------------|-----------|
| **Parent Account** | Name, email, password hash | Parents | Consent (COPPA) | Account lifetime + 30 days |
| **Learner Profile** | Name, DOB, grade, school | Children | Parental consent | Account lifetime + 30 days |
| **Cognitive Profile** | Brain state, learning preferences, sensory profile | Children | Parental consent + legitimate interest | Account lifetime |
| **IEP Documents** | PDF uploads, extracted goals | Children | Parental consent | Account lifetime |
| **Assessment Data** | Questionnaire responses, baseline scores | Children | Parental consent | Account lifetime |
| **Learning Activity** | Session history, progress, grades | Children | Legitimate interest | Account lifetime |
| **Engagement Data** | XP events, badges, streaks | Children | Legitimate interest | Account lifetime |
| **Billing Data** | Stripe customer ID, subscription status | Parents | Contract | 7 years (tax) |
| **Communication** | Notification preferences, email history | Parents/Teachers | Consent | 2 years |
| **Location** | State, ZIP code, district | Parents | Consent (optional) | Account lifetime |

### 2.2 Data Flows

```
Parent → identity-svc → PostgreSQL (encrypted at rest)
Parent → assessment-svc → brain-svc → learner cognitive profile
Parent → family-svc → S3 (IEP documents, data exports)
Learner → learning-svc → ai-svc → content generation (no PII sent to LLM)
Teacher → identity-svc → read-only brain profile access
```

### 2.3 Third-Party Data Sharing

| Third Party | Data Shared | Purpose | DPA Status |
|-------------|------------|---------|------------|
| Anthropic (Claude) | Anonymized learning context | AI content generation | Required |
| Google (Gemini) | Anonymized learning context | AI fallback | Required |
| OpenAI | Anonymized learning context | Vision/embeddings | Required |
| Stripe | Parent email, subscription data | Billing | In place |
| Hetzner Cloud | Hosting (data at rest) | Infrastructure | In place |
| AWS S3 | Encrypted file storage | Document storage | In place |
| Sentry | Error data (PII filtered) | Error tracking | In place |
| Langfuse | Redacted LLM traces | AI observability | Required |

## 3. Risk Assessment

### 3.1 Identified Risks

| Risk | Likelihood | Impact | Mitigation | Residual Risk |
|------|-----------|--------|------------|---------------|
| Unauthorized access to child data | Low | Critical | RLS, RBAC, JWT, audit logging | Low |
| Data breach via SQL injection | Very Low | Critical | Parameterized queries (Drizzle ORM), input validation (Zod) | Very Low |
| LLM prompt injection exposing PII | Low | High | Prompt sanitizer, PII redaction in Langfuse traces | Low |
| Cross-tenant data leakage | Very Low | Critical | PostgreSQL RLS on all tables, `app.current_tenant_id` | Very Low |
| Unauthorized IEP document access | Low | High | S3 presigned URLs, parent-only access control | Low |
| Child data sent to LLM providers | Low | High | Brain context anonymization, no direct PII in prompts | Low |

### 3.2 Data Protection by Design

| Principle | Implementation |
|-----------|---------------|
| **Data minimization** | Only essential data collected; optional fields clearly marked |
| **Purpose limitation** | Data used only for stated educational purposes |
| **Storage limitation** | Retention policies enforced; GDPR erasure pipeline |
| **Accuracy** | Parents can update/correct all child data |
| **Integrity** | Audit trail, input validation, database constraints |
| **Confidentiality** | Encryption at rest and in transit, RLS, RBAC |

## 4. Data Subject Rights

| Right | Implementation | Endpoint |
|-------|---------------|----------|
| Right of access | Parent dashboard shows all child data | Dashboard UI |
| Right to rectification | Parents can edit learner profiles | `/api/learners/:id` PUT |
| Right to erasure | Cascading delete pipeline | `/api/learners/:id` DELETE |
| Right to portability | ZIP export (JSON + Markdown) | `/api/learners/:id/data-export` GET |
| Right to restriction | Account suspension capability | Admin dashboard |
| Right to object | Opt-out of AI profiling | Settings page |

## 5. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Data Protection Officer | ________________ | ________ | ________ |
| Engineering Lead | ________________ | ________ | ________ |
| Legal Counsel | ________________ | ________ | ________ |

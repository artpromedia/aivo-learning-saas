# Data Breach Notification Procedure

## Scope

This procedure applies to any confirmed or suspected unauthorized access to, or disclosure of, personal data processed by AIVO Learning Platform.

## Regulatory Requirements

| Regulation | Notification Deadline | Notify |
|------------|----------------------|--------|
| GDPR (Article 33) | 72 hours to supervisory authority | Data Protection Authority + affected users |
| FERPA | "Reasonable period" | Educational institution + parents |
| COPPA | "Promptly" | FTC + affected parents |
| State laws (varies) | 30-72 hours depending on state | State AG + affected residents |

## Breach Classification

| Level | Description | Examples |
|-------|-------------|----------|
| **P1 — Critical** | Mass data exposure, child PII compromised | Database breach, S3 bucket exposure |
| **P2 — High** | Limited PII exposure, single tenant affected | Unauthorized access to learner data |
| **P3 — Medium** | Non-PII data exposed, no child data | Internal system credentials leaked |
| **P4 — Low** | Attempted breach detected, no data compromised | Failed authentication attacks |

## Response Timeline

### Hour 0-1: Detection & Containment

1. **Detect**: Alert received via Sentry, Prometheus, Gitleaks, or manual report
2. **Triage**: On-call engineer classifies severity (P1-P4)
3. **Contain**: Immediate actions:
   - Revoke compromised credentials
   - Block attacker IP addresses (Cloudflare WAF)
   - Disable affected service if necessary
   - Preserve forensic evidence (logs, snapshots)
4. **Escalate**: Notify incident commander and security lead

### Hour 1-4: Assessment

1. **Scope**: Determine what data was accessed/exfiltrated
2. **Impact**: Identify affected users, tenants, and data types
3. **Root Cause**: Begin forensic analysis
4. **Document**: Start incident timeline log

### Hour 4-24: Notification Preparation

1. **Legal review**: Determine regulatory notification requirements
2. **Draft notifications**: Prepare communications for:
   - Supervisory authority (GDPR DPA)
   - Affected users/parents
   - School district partners (if B2B data affected)
3. **Remediation plan**: Document steps to prevent recurrence

### Hour 24-72: Notification Execution

1. **Regulatory notification**: Submit to relevant DPA within 72 hours (GDPR)
2. **User notification**: Send via email (comms-svc) to affected users
3. **Partner notification**: Notify affected school districts
4. **Public disclosure**: If required by scope/regulation

### Post-Incident (Week 1-4)

1. **Root cause analysis**: Complete forensic investigation
2. **Remediation**: Implement fixes and additional controls
3. **Post-mortem**: Conduct blameless retrospective
4. **Update procedures**: Revise security controls based on findings
5. **Re-test**: Verify remediation effectiveness

## Notification Templates

### Supervisory Authority Notification

Include:
- Nature of the breach
- Categories and approximate number of data subjects
- Categories and approximate number of records
- Contact details of the DPO
- Likely consequences of the breach
- Measures taken or proposed to address the breach

### User/Parent Notification

Include:
- Plain language description of what happened
- What data was involved
- What we are doing about it
- What they can do to protect themselves
- Contact information for questions

## Contact List

| Role | Responsibility |
|------|---------------|
| Incident Commander | Overall coordination, external communication |
| Security Lead | Technical investigation, containment |
| Legal Counsel | Regulatory compliance, notification drafting |
| Communications Lead | User notifications, public statements |
| Engineering Lead | Technical remediation |

## Evidence Preservation

All breach-related evidence must be preserved for minimum 5 years:
- System logs (Grafana Loki)
- Audit trail records (`audit_events` table)
- Network logs
- Forensic snapshots
- Communication records

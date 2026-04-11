# SOC 2 Type II Evidence Collection Guide

## Overview

This guide outlines what evidence to collect for each Trust Services Criteria during a SOC 2 Type II audit. The audit period is typically 6-12 months.

## Evidence Categories

### 1. Access Controls (CC6)

| Evidence | Source | Collection Method |
|----------|--------|-------------------|
| User access provisioning logs | `audit_events` table | SQL query: `SELECT * FROM audit_events WHERE event_type IN ('USER_CREATED', 'ROLE_CHANGED')` |
| Authentication logs | `audit_events` table | SQL query: `SELECT * FROM audit_events WHERE event_type = 'LOGIN'` |
| Access revocation records | `audit_events` table | SQL query: `SELECT * FROM audit_events WHERE event_type IN ('USER_DISABLED', 'SESSION_REVOKED')` |
| RLS policy definitions | Database | `SELECT * FROM pg_policies` |
| JWT configuration | `identity-svc` config | Environment variables (key rotation schedule) |

### 2. Change Management (CC8)

| Evidence | Source | Collection Method |
|----------|--------|-------------------|
| Pull request history | GitHub | GitHub API: `GET /repos/artpromedia/aivo-learning-saas/pulls?state=closed` |
| CI/CD pipeline runs | GitHub Actions | GitHub API: `GET /repos/artpromedia/aivo-learning-saas/actions/runs` |
| Deployment history | Helm | `helm history aivo-learning -n aivo` |
| Code review approvals | GitHub | PR review records |
| Production approval gates | GitHub Environments | `production-approval` environment logs |

### 3. Monitoring & Incident Response (CC7)

| Evidence | Source | Collection Method |
|----------|--------|-------------------|
| Uptime records | status-page-svc + Prometheus | Grafana dashboard export |
| Alert history | Alertmanager | Alertmanager API |
| Incident records | GitHub Issues | Issues with `incident` label |
| Sentry error reports | Sentry | Sentry API export |
| Grafana dashboard screenshots | Grafana | Scheduled report exports |

### 4. Data Protection (C1, P1)

| Evidence | Source | Collection Method |
|----------|--------|-------------------|
| Encryption configuration | Infrastructure | TLS certificate records, S3 encryption settings |
| Data deletion records | `audit_events` table | `SELECT * FROM audit_events WHERE event_type = 'DATA_DELETED'` |
| Data export records | `audit_events` table | `SELECT * FROM audit_events WHERE event_type = 'DATA_EXPORTED'` |
| Consent records | `consent_records` table | SQL query |
| Privacy policy versions | Marketing site | Git history of privacy policy page |

### 5. Availability & Recovery (A1)

| Evidence | Source | Collection Method |
|----------|--------|-------------------|
| Backup records | S3 bucket | `aws s3 ls s3://aivo-backups/` |
| Backup restore test results | CI workflow | `.github/workflows/backup-verify.yml` run history |
| DR test records | Manual/automated | DR drill documentation |
| Replication lag metrics | Prometheus | `pg_replication_lag_seconds` metric |
| Capacity monitoring | Prometheus/Grafana | Resource utilization dashboards |

### 6. Vulnerability Management (CC3, CC7)

| Evidence | Source | Collection Method |
|----------|--------|-------------------|
| Vulnerability scan results | CI workflows | Trivy, npm audit, pip audit SARIF reports |
| Secret scanning results | Gitleaks | `.github/workflows/secret-scan.yml` results |
| Dependency update history | Renovate | PR history for dependency updates |
| SBOM artifacts | CI artifacts | CycloneDX SBOM JSON files |
| License compliance reports | CI | `license-checker` output |

## Audit Period Requirements

- **Minimum period**: 6 months of continuous evidence
- **Recommended period**: 12 months
- **Evidence retention**: Minimum 3 years after audit completion

## Automated Evidence Collection

Set up scheduled exports:
```bash
# Weekly: Export audit events
psql $DATABASE_URL -c "COPY (SELECT * FROM audit_events WHERE created_at > NOW() - INTERVAL '7 days') TO STDOUT WITH CSV HEADER" > audit_export_$(date +%Y%m%d).csv

# Monthly: Export access review
psql $DATABASE_URL -c "COPY (SELECT id, email, role, status, created_at, updated_at FROM users) TO STDOUT WITH CSV HEADER" > access_review_$(date +%Y%m%d).csv
```

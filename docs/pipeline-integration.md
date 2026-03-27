# AIVO Learning Platform — CI/CD Pipeline Integration

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PR Validation                                │
│  ci.yml                                                             │
│  ├── lint-typecheck                                                 │
│  ├── secret-scan (Gitleaks)                                         │
│  ├── integration-tests (Postgres, identity-svc)                     │
│  ├── e2e-tests (Postgres + Redis + NATS, Playwright)                │
│  ├── smoke-test                                                     │
│  ├── rls-verify (RLS policies on Postgres)                          │
│  ├── python-lint + python-tests (ai-svc)                            │
│  └── coverage-gate (70% lines/functions, 60% branches)              │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Merge to main/develop
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Staging Deploy                                  │
│  deploy-staging.yml                                                 │
│  ├── Stage 2: Docker Build Matrix                                   │
│  │   ├── resolve (split 15 services → python/web/backend)           │
│  │   ├── build-push-python (ai-svc, brain-svc)                     │
│  │   ├── build-push-web (web, marketing)                            │
│  │   ├── build-push (12 backend services)                           │
│  │   ├── build-backup-agent                                         │
│  │   ├── verify-images                                              │
│  │   └── Trivy SARIF scan (all images)                              │
│  ├── Stage 3: Hetzner Staging Deploy                                │
│  │   ├── kubectl configure (KUBE_CONFIG secret)                     │
│  │   ├── Helm upgrade (values/hetzner.yaml + image tags)            │
│  │   ├── Rollout verification (15 services + research-worker)       │
│  │   └── Staging smoke tests (pod health + restarts)                │
│  └── Stage 4: Release                                               │
│      ├── Tag images (matrix, max-parallel: 10)                      │
│      └── GitHub Release (staging-main-{SHA})                        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Manual trigger
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Create Release                                  │
│  create-release.yml (manual dispatch)                               │
│  ├── Validate semver + check tag doesn't exist                      │
│  ├── Verify all 15 images in GHCR                                   │
│  ├── Re-tag images: main-{SHA} → v{X.Y.Z} (matrix)                 │
│  └── GitHub Release with changelog + image table                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Release published
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Production Deploy                                 │
│  deploy-production.yml                                              │
│  ├── Stage 1: Validate version + verify 15 images                   │
│  ├── Stage 2: Manual approval gate (production-approval env)        │
│  ├── Stage 3: Canary deployment                                     │
│  │   ├── Helm deploy all services                                   │
│  │   ├── Health-check identity-svc + web                            │
│  │   ├── 5-minute soak period                                       │
│  │   └── Fail if restarts >= 2                                      │
│  ├── Stage 4: Full rollout (helm --atomic --wait)                   │
│  │   └── Rollout verification (all 16 workloads)                    │
│  └── Stage 5: Production smoke tests                                │
│      ├── 60-second stabilization                                    │
│      └── All services: Ready + restart count                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Parallel Workflows

These workflows run independently of the main deploy chain:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `secret-scan.yml` | Push/PR + weekly Mon 03:00 UTC | Gitleaks with SARIF upload |
| `i18n-coverage.yml` | PR (i18n paths) | Translation coverage audit |
| `visual-regression.yml` | PR (web/brand) | Argos visual regression screenshots |
| `load-test.yml` | Manual + weekly Sun 02:00 UTC | k6 auth-flow + learner-dashboard |
| `marketing-deploy.yml` | Push to main (marketing) | Build + deploy marketing to Hetzner |
| `marketing-lighthouse.yml` | PR (marketing/brand) | Lighthouse audit (perf/a11y/bp/seo >= 0.9) |
| `mobile-build.yml` | PR (mobile) | Flutter analyze + test + build APK/iOS |
| `mobile-release.yml` | Manual dispatch | Fastlane deploy to Play Store / App Store |
| `infra-deploy.yml` | Push to main (infra/services) | Terraform apply + Helm deploy |
| `infra-plan.yml` | PR (terraform) | Terraform plan posted as PR comment |

## Service Port Map

| Service | Port | Type |
|---------|------|------|
| identity-svc | 3001 | Fastify (Node.js) |
| brain-svc | 3002 | FastAPI (Python) |
| learning-svc | 3003 | Fastify (Node.js) |
| engagement-svc | 3004 | Fastify (Node.js) |
| family-svc | 3005 | Fastify (Node.js) |
| tutor-svc | 3006 | Fastify (Node.js) |
| comms-svc | 3007 | Fastify (Node.js) |
| billing-svc | 3008 | Fastify (Node.js) |
| admin-svc | 3009 | Fastify (Node.js) |
| integrations-svc | 3010 | Fastify (Node.js) |
| i18n-svc | 3011 | Fastify (Node.js) |
| status-page-svc | 3012 | Fastify (Node.js) |
| research-svc | 3013 | Fastify (Node.js) |
| ai-svc | 5000 | FastAPI (Python) |
| web | 3000 | Next.js |
| marketing | 3000 | Next.js |

## Docker Image Registry

**Registry:** `ghcr.io/artpromedia`

**Tag Strategy:**
- Staging: `main-{SHA_SHORT}` (e.g., `main-a1b2c3d`)
- Latest: `latest`
- SHA: `sha-{SHORT}` (e.g., `sha-a1b2c3d`)
- Release: `v{SEMVER}` (e.g., `v1.2.3`)
- Verified: `staging-verified`

**Special:** `research-worker` shares the `research-svc` image.

## Infrastructure

**Platform:** Hetzner Cloud (Kubernetes)
- **Namespace:** `aivo`
- **Helm chart:** `infra/helm/` with `values/hetzner.yaml`
- **Terraform:** `infra/terraform/environments/prod/`
- **Secrets:** `KUBE_CONFIG`, `HCLOUD_TOKEN`, `HETZNER_OBJECT_STORAGE_KEY_ID/SECRET`

**Monitoring:**
- Prometheus: `infra/monitoring/prometheus/` (service discovery, alert rules)
- Grafana: `infra/monitoring/grafana/` (service overview, database, NATS, AI dashboards)
- Alertmanager: `infra/monitoring/alertmanager/` (routes to comms-svc webhook)

## Required GitHub Secrets

| Secret | Used By | Purpose |
|--------|---------|---------|
| `KUBE_CONFIG` | deploy-staging, deploy-production, infra-deploy | Base64-encoded kubeconfig |
| `HCLOUD_TOKEN` | infra-deploy, infra-plan | Hetzner Cloud API token |
| `HETZNER_OBJECT_STORAGE_KEY_ID` | infra-deploy, infra-plan | Terraform S3 backend |
| `HETZNER_OBJECT_STORAGE_SECRET` | infra-deploy, infra-plan | Terraform S3 backend |
| `GHCR_TOKEN` | All build/deploy workflows | GHCR push (falls back to GITHUB_TOKEN) |
| `TURBO_TOKEN` | ci.yml | Turborepo remote cache |
| `TURBO_TEAM` | ci.yml | Turborepo remote cache |
| `ARGOS_TOKEN` | visual-regression | Argos CI upload |
| `DOCKERHUB_USERNAME` | build workflows | Docker Hub login (optional) |
| `DOCKERHUB_TOKEN` | build workflows | Docker Hub login (optional) |
| `ANDROID_KEYSTORE_BASE64` | mobile-release | Android signing |
| `GOOGLE_PLAY_JSON_KEY` | mobile-release | Play Store API |
| `IOS_CERTIFICATE_BASE64` | mobile-release | iOS signing |
| `APP_STORE_API_KEY` | mobile-release | App Store Connect |

## GitHub Environments

| Environment | Purpose | Protection |
|-------------|---------|------------|
| `staging` | Staging deploys | None (auto-deploy) |
| `production-approval` | Manual approval gate | Required reviewers |
| `production` | Production deploys | Deployment logs |

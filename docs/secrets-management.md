# Secrets Management

## Architecture

### Current State: Kubernetes Secrets
All secrets are stored as Kubernetes Secrets, mounted as environment variables into service pods via Helm chart templates.

### Target State: HashiCorp Vault
Migrate to HashiCorp Vault for centralized secrets management with auto-rotation.

## Vault Integration

### Helm Chart Configuration

Vault is deployed via the official Helm chart with the following values:

```yaml
vault:
  server:
    ha:
      enabled: true
      replicas: 3
      raft:
        enabled: true
    dataStorage:
      size: 10Gi
    auditStorage:
      enabled: true
      size: 10Gi
  injector:
    enabled: true
    replicas: 2
```

### Service Integration

Services use the Vault Agent Injector to receive secrets as files:

```yaml
annotations:
  vault.hashicorp.com/agent-inject: "true"
  vault.hashicorp.com/role: "identity-svc"
  vault.hashicorp.com/agent-inject-secret-db: "secret/data/aivo/identity-svc/database"
  vault.hashicorp.com/agent-inject-template-db: |
    {{- with secret "secret/data/aivo/identity-svc/database" -}}
    DATABASE_URL={{ .Data.data.url }}
    {{- end }}
```

### Secret Paths

| Path | Service(s) | Contents |
|------|-----------|----------|
| `secret/aivo/shared/database` | All services | `DATABASE_URL` |
| `secret/aivo/shared/jwt` | All services | `JWT_PUBLIC_KEY` |
| `secret/aivo/identity-svc/auth` | identity-svc | `AUTH_SECRET`, `JWT_PRIVATE_KEY` |
| `secret/aivo/ai-svc/providers` | ai-svc | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` |
| `secret/aivo/ai-svc/langfuse` | ai-svc | `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` |
| `secret/aivo/billing-svc/stripe` | billing-svc | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `secret/aivo/comms-svc/email` | comms-svc | `OONRUMAIL_API_KEY` |
| `secret/aivo/comms-svc/push` | comms-svc | FCM credentials, VAPID keys |
| `secret/aivo/integrations-svc/oauth` | integrations-svc | Clever, ClassLink OAuth secrets |

## Rotation Policy

| Secret Type | Rotation Interval | Method |
|-------------|-------------------|--------|
| Database credentials | 30 days | Vault dynamic secrets (PostgreSQL backend) |
| API keys (Anthropic, OpenAI, Google) | 90 days | Manual rotation via Vault UI |
| JWT RSA keys | 180 days | Key pair generation + rolling deployment |
| AUTH_SECRET | 90 days | Update + rolling restart (invalidates sessions) |
| Stripe keys | Per Stripe dashboard | Manual update in Vault |
| OAuth client secrets | 90 days | Provider dashboard + Vault update |

### Rotation Procedure

1. Generate new secret value
2. Update in Vault (or let Vault auto-rotate for dynamic secrets)
3. Vault Agent Injector detects change and restarts pod
4. Verify service health after restart
5. Revoke old secret value

### Dynamic Database Credentials
Vault can generate short-lived PostgreSQL credentials automatically:

```hcl
resource "vault_database_secret_backend_role" "aivo_services" {
  backend             = vault_mount.db.path
  name                = "aivo-service"
  db_name             = vault_database_secret_backend_connection.postgres.name
  creation_statements = ["CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}' IN ROLE aivo_service_role;"]
  default_ttl         = "3600"
  max_ttl             = "86400"
}
```

## Environment Variable Validation

All services validate environment variables at startup:
- **TypeScript services**: Zod schema in `src/config.ts` — fails fast if required vars are missing
- **Python services**: Pydantic `BaseSettings` in `config.py` — type-checked and validated

This ensures that secret mount failures are caught immediately rather than at runtime.

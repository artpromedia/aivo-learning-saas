# Runbook: AI Provider Outage

## Symptoms
- Tutor sessions failing or timing out
- Lesson generation returning errors
- IEP parsing failing
- Circuit breaker on ai-client plugins showing "open" state
- Prometheus `llm_request_duration_seconds` spiking or `llm_errors_total` increasing

## Triage Steps

### 1. Check ai-svc health and logs
```bash
kubectl logs -n aivo -l app.kubernetes.io/name=ai-svc --tail=100
```

### 2. Check provider status pages
- **Anthropic**: https://status.anthropic.com
- **OpenAI**: https://status.openai.com
- **Google AI**: https://status.cloud.google.com

### 3. Check Langfuse dashboard
- Review recent traces for error rates by model/provider
- Check if failures are isolated to one provider or all

### 4. Check circuit breaker status
- Services with ai-client plugins (learning-svc, tutor-svc, assessment-svc) will have open circuit breakers if ai-svc is failing
- Circuit breakers auto-reset after 30 seconds

## Common Causes & Fixes

### Single provider down (e.g., Anthropic)
- **Fix**: The LLM gateway automatically fails over to the fallback model
- **Tier routing**: REASONING/SMART/FAST tiers each have a primary + fallback model
- **Verify failover**: Check ai-svc logs for "Attempting failover" messages

### All providers down
- **Fix**: This is rare but possible during coordinated outages
- **Impact**: Tutor sessions, lesson generation, IEP parsing will fail
- **Mitigation**: Core platform (brain profiles, assessments, gamification) continues to work
- **Action**: Monitor provider status pages and wait for recovery

### Rate limiting
- **Symptom**: 429 errors in ai-svc logs
- **Fix**: Check per-tenant token quota usage in `tenant_usages` table
- **If platform-wide**: Contact provider to increase rate limits

### API key expiration
- **Symptom**: 401 errors in ai-svc logs
- **Fix**: Rotate the API key in Kubernetes secrets
```bash
kubectl edit secret ai-secrets -n aivo
kubectl rollout restart deployment/ai-svc -n aivo
```

## Model Configuration Reference

| Tier | Primary Model | Fallback Model | Timeout |
|------|--------------|----------------|---------|
| REASONING | claude-sonnet-4 | gemini-2.0-flash | 30s |
| SMART | claude-sonnet-4 | gemini-2.0-flash | 30s |
| FAST | claude-sonnet-4 | gemini-2.0-flash | 30s |
| VISION | gemini-2.0-flash | gpt-4o | 60s |

## Impact
AI provider outages affect:
- Tutor sessions (Module 2B) — sessions cannot start
- Lesson generation (Module 3A) — new daily paths cannot be generated
- IEP parsing (Module 1A) — PDF extraction fails
- i18n translations (i18n-svc depends on ai-svc)

Not affected: Brain profiles, assessments (already completed), gamification, billing, family management, auth.

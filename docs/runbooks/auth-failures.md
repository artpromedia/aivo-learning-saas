# Runbook: Authentication Failures

## Symptoms
- Users unable to log in
- "Unauthorized" errors across the platform
- JWT validation failures in service logs
- Session cookies not being set
- Mobile app token refresh failing

## Triage Steps

### 1. Check identity-svc health
```bash
kubectl logs -n aivo -l app.kubernetes.io/name=identity-svc --tail=100
curl -s http://identity-svc:3001/health | jq
```

### 2. Verify JWT keys are mounted
```bash
kubectl exec -n aivo deploy/identity-svc -- env | grep JWT
```

### 3. Test auth flow directly
```bash
curl -X POST http://identity-svc:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -v
```

### 4. Check CSRF endpoint
```bash
curl http://identity-svc:3001/csrf-token
```

## Common Causes & Fixes

### JWT key mismatch
- **Symptom**: Services log "invalid signature" when verifying tokens
- **Cause**: `JWT_PUBLIC_KEY` on downstream services doesn't match `JWT_PRIVATE_KEY` on identity-svc
- **Fix**: Ensure all services use the same key pair
```bash
kubectl get secret jwt-secrets -n aivo -o jsonpath='{.data.JWT_PUBLIC_KEY}' | base64 -d
```

### AUTH_SECRET changed
- **Symptom**: All existing sessions invalidated, users forced to re-login
- **Cause**: `AUTH_SECRET` rotated without grace period
- **Fix**: This is expected during secret rotation; users will need to re-authenticate

### Cookie not set (web)
- **Symptom**: Login succeeds but subsequent requests are unauthenticated
- **Cause**: Cookie domain/path mismatch, or `Secure` flag when not using HTTPS
- **Fix**: Check cookie settings in identity-svc auth configuration

### Bearer token expired (mobile)
- **Symptom**: Mobile app shows auth errors
- **Cause**: Refresh token expired or revoked
- **Fix**: User needs to re-authenticate; check Dio AuthInterceptor logs

### Database connection failure
- **Symptom**: Login fails with 500 error
- **Fix**: Check identity-svc database connectivity (see database-issues.md)

## Auth Architecture Reference

| Component | Flow |
|-----------|------|
| Web login | POST `/api/auth/login` → sets `access_token` + `refresh_token` cookies |
| Mobile login | POST `/api/auth/login` → returns tokens in body → stored in SecureStorage |
| Token refresh | Auto-retry on 401 via `apiFetch` (web) or Dio interceptor (mobile) |
| Learner login | PIN-based via `/api/auth/learner-login` |
| Session check | GET `/api/auth/session` → returns user + role |
| CSRF | GET `/csrf-token` → double-submit cookie pattern |

## Impact
Auth failures are critical — they block all authenticated functionality. Prioritize fixing identity-svc issues immediately.

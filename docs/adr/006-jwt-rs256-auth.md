# ADR-006: JWT RS256 Authentication with Cookie + Bearer Support

**Status:** Accepted
**Date:** 2025-01-20
**Deciders:** Engineering team

## Context

AIVO serves multiple client types: a Next.js web app (cookie-based), a Flutter mobile app (Bearer token), and service-to-service calls. We needed an auth strategy that supports all three while maintaining COPPA/FERPA compliance for child data.

## Decision

Use JWT tokens signed with RS256 (asymmetric RSA keys) via `identity-svc` (better-auth library).

- **Token types**: `access_token` (short-lived) + `refresh_token` (long-lived)
- **Web app**: Tokens stored in HTTP-only secure cookies, set by identity-svc
- **Mobile app**: Tokens stored in Flutter SecureStorage, sent via `Authorization: Bearer` header
- **Service-to-service**: JWT public key distributed to all services for local verification
- **Learner auth**: PIN-based login (e.g., `1234`) — simplified for children
- **CSRF protection**: Double-submit cookie pattern via `/csrf-token` endpoint

Key configuration:
- `JWT_PRIVATE_KEY`: RSA PKCS8 PEM (identity-svc only)
- `JWT_PUBLIC_KEY`: RSA SPKI PEM (distributed to all services)
- `AUTH_SECRET`: Session encryption key

## Consequences

### Positive

- RS256 asymmetric keys: only identity-svc holds the private key; all services verify with the public key
- Cookie + Bearer dual support serves web and mobile with the same token format
- Auto-refresh on 401 handled by `apiFetch` (web) and Dio AuthInterceptor (mobile)
- COPPA-compliant: no third-party tracking, parental consent gates

### Negative

- RSA key management adds operational complexity (key rotation requires coordinated deployment)
- Cookie-based auth requires CSRF protection
- PIN-based learner auth is less secure (mitigated by parent-controlled account creation)

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| HS256 (symmetric) | Simpler key management | Shared secret across all services — security risk |
| OAuth 2.0 + OIDC | Industry standard | Overkill for internal services, added complexity |
| Session-based auth | Simple server-side | Poor fit for microservices, no stateless verification |
| Passport.js | Mature, many strategies | Too tightly coupled to Express, not Fastify-native |

# Caching Strategy

## CDN Cache Rules (Cloudflare)

### Static Assets (Immutable)
| Path Pattern | Cache TTL | Headers |
|-------------|-----------|---------|
| `/_next/static/*` | 1 year | `Cache-Control: public, max-age=31536000, immutable` |
| `/assets/*` | 1 year | `Cache-Control: public, max-age=31536000, immutable` |
| `*.woff2`, `*.woff` | 1 year | `Cache-Control: public, max-age=31536000, immutable` |
| `/favicon.ico`, `/robots.txt` | 1 day | `Cache-Control: public, max-age=86400` |

### Dynamic Content (No Cache)
| Path Pattern | Cache TTL | Headers |
|-------------|-----------|---------|
| `/api/*` | No cache | `Cache-Control: no-store, no-cache, must-revalidate` |
| `/dashboard/*` | No cache | Varies (SSR) |
| `/login`, `/register` | No cache | Server-rendered |

### Marketing Site (Static Export)
| Path Pattern | Cache TTL | Headers |
|-------------|-----------|---------|
| `/*` (HTML pages) | 1 hour | `Cache-Control: public, max-age=3600, s-maxage=86400` |
| `/_next/static/*` | 1 year | `Cache-Control: public, max-age=31536000, immutable` |

## Redis Cache Keys

### Key Naming Convention
```
aivo:{service}:{entity}:{id}
```

### Key Structure

| Key Pattern | TTL | Service | Purpose |
|-------------|-----|---------|---------|
| `aivo:session:{sessionId}` | 24h | identity-svc | User session data |
| `aivo:ratelimit:{tenantId}:{endpoint}` | 1min | identity-svc | API rate limiting (sliding window) |
| `aivo:brain:{learnerId}` | 30min | brain-svc | Cached brain profile |
| `aivo:curriculum:{framework}:{grade}` | 24h | brain-svc | Curriculum skill maps |
| `aivo:feature:{tenantId}` | 5min | feature-flags | Tenant feature flags |
| `aivo:i18n:{locale}:{namespace}` | 1h | i18n-svc | Translation bundles |
| `aivo:status:{service}` | 30s | status-page-svc | Service health status |

### Cache Invalidation Rules

1. **Write-through**: Brain profile updates invalidate `aivo:brain:{learnerId}`
2. **Event-driven**: NATS events trigger cache invalidation across services
3. **TTL-based**: All cached data has explicit TTL — no indefinite caching
4. **Tenant-scoped**: All cache keys include tenant context where applicable

## Next.js Bundle Optimization

### Bundle Analyzer
The web app includes `@next/bundle-analyzer` for identifying large dependencies:

```bash
cd apps/web && ANALYZE=true pnpm run build
```

### Code Splitting Strategy
- **Route-based splitting**: Next.js App Router auto-splits by route
- **Dynamic imports**: Heavy components (charts, editors) loaded via `next/dynamic`
- **Package splitting**: `optimizePackageImports` in `next.config.ts` for icon libraries
- **Image optimization**: `next/image` with WebP conversion and responsive sizing

### Bundle Size Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| First Load JS | < 100KB | `next build` output |
| Route JS (dashboard) | < 50KB per route | Bundle analyzer |
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |

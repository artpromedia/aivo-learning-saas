# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./

# Copy workspace packages
COPY packages/db/package.json packages/db/
COPY packages/events/package.json packages/events/
COPY packages/observability/package.json packages/observability/

# Copy service
COPY services/i18n-svc/package.json services/i18n-svc/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false
# Copy source
COPY packages/db/ packages/db/
COPY packages/events/ packages/events/
COPY packages/observability/ packages/observability/
COPY services/i18n-svc/ services/i18n-svc/

# Build dependencies then service
RUN pnpm --filter @aivo/db build && \
    pnpm --filter @aivo/events build && \
    pnpm --filter @aivo/observability build && \
    pnpm --filter i18n-svc build:docker

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate && \
    addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy built packages
COPY --from=builder /app/packages/db/package.json packages/db/
COPY --from=builder /app/packages/db/dist/ packages/db/dist/
COPY --from=builder /app/packages/events/package.json packages/events/
COPY --from=builder /app/packages/events/dist/ packages/events/dist/
COPY --from=builder /app/packages/observability/package.json packages/observability/
COPY --from=builder /app/packages/observability/dist/ packages/observability/dist/

# Copy built service
COPY --from=builder /app/services/i18n-svc/package.json services/i18n-svc/
COPY --from=builder /app/services/i18n-svc/dist/ services/i18n-svc/dist/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

USER appuser

ENV NODE_ENV=production
ENV PORT=3011

EXPOSE 3011

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3011/i18n/health || exit 1

CMD ["node", "services/i18n-svc/dist/index.js"]

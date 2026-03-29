# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:22.22.1-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./

COPY packages/brand/package.json packages/brand/
COPY packages/db/package.json packages/db/
COPY packages/events/package.json packages/events/
COPY packages/observability/package.json packages/observability/

COPY services/status-page-svc/package.json services/status-page-svc/

RUN pnpm install --frozen-lockfile --prod=false
COPY packages/brand/ packages/brand/
COPY packages/db/ packages/db/
COPY packages/events/ packages/events/
COPY packages/observability/ packages/observability/
COPY services/status-page-svc/ services/status-page-svc/

RUN pnpm --filter @aivo/brand build && \
    pnpm --filter @aivo/db build && \
    pnpm --filter @aivo/events build && \
    pnpm --filter @aivo/observability build && \
    pnpm --filter @aivo/status-page-svc build:docker

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22.22.1-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate && \
    addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY --from=builder /app/packages/brand/package.json packages/brand/
COPY --from=builder /app/packages/brand/dist/ packages/brand/dist/
COPY --from=builder /app/packages/db/package.json packages/db/
COPY --from=builder /app/packages/db/dist/ packages/db/dist/
COPY --from=builder /app/packages/events/package.json packages/events/
COPY --from=builder /app/packages/events/dist/ packages/events/dist/
COPY --from=builder /app/packages/observability/package.json packages/observability/
COPY --from=builder /app/packages/observability/dist/ packages/observability/dist/

COPY --from=builder /app/services/status-page-svc/package.json services/status-page-svc/
COPY --from=builder /app/services/status-page-svc/dist/ services/status-page-svc/dist/

RUN pnpm install --frozen-lockfile --prod

USER appuser

ENV NODE_ENV=production
ENV PORT=3013

EXPOSE 3013

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3013/health || exit 1

CMD ["node", "services/status-page-svc/dist/index.js"]

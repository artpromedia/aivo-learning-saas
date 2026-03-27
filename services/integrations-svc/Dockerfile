# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./

COPY packages/db/package.json packages/db/
COPY packages/events/package.json packages/events/

COPY services/integrations-svc/package.json services/integrations-svc/

RUN pnpm install --frozen-lockfile

COPY packages/db/ packages/db/
COPY packages/events/ packages/events/
COPY services/integrations-svc/ services/integrations-svc/

RUN pnpm --filter @aivo/db build && \
    pnpm --filter @aivo/events build && \
    pnpm --filter @aivo/integrations-svc build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate && \
    addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY --from=builder /app/packages/db/package.json packages/db/
COPY --from=builder /app/packages/db/dist/ packages/db/dist/
COPY --from=builder /app/packages/events/package.json packages/events/
COPY --from=builder /app/packages/events/dist/ packages/events/dist/

COPY --from=builder /app/services/integrations-svc/package.json services/integrations-svc/
COPY --from=builder /app/services/integrations-svc/dist/ services/integrations-svc/dist/

RUN pnpm install --frozen-lockfile --prod

USER appuser

ENV NODE_ENV=production
ENV PORT=3010

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3010/health || exit 1

CMD ["node", "services/integrations-svc/dist/index.js"]

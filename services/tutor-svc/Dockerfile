# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:22.22.1-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./

# Copy workspace packages
COPY packages/brand/package.json packages/brand/
COPY packages/db/package.json packages/db/
COPY packages/events/package.json packages/events/
COPY packages/observability/package.json packages/observability/

# Copy service
COPY services/tutor-svc/package.json services/tutor-svc/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false
# Copy source
COPY packages/brand/ packages/brand/
COPY packages/db/ packages/db/
COPY packages/events/ packages/events/
COPY packages/observability/ packages/observability/
COPY services/tutor-svc/ services/tutor-svc/

# Build dependencies then service
RUN pnpm --filter @aivo/brand build && \
    pnpm --filter @aivo/db build && \
    pnpm --filter @aivo/events build && \
    pnpm --filter @aivo/observability build && \
    pnpm --filter tutor-svc build:docker

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22.22.1-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate && \
    addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy built packages
COPY --from=builder /app/packages/brand/package.json packages/brand/
COPY --from=builder /app/packages/brand/dist/ packages/brand/dist/
COPY --from=builder /app/packages/db/package.json packages/db/
COPY --from=builder /app/packages/db/dist/ packages/db/dist/
COPY --from=builder /app/packages/events/package.json packages/events/
COPY --from=builder /app/packages/events/dist/ packages/events/dist/
COPY --from=builder /app/packages/observability/package.json packages/observability/
COPY --from=builder /app/packages/observability/dist/ packages/observability/dist/

# Copy built service
COPY --from=builder /app/services/tutor-svc/package.json services/tutor-svc/
COPY --from=builder /app/services/tutor-svc/dist/ services/tutor-svc/dist/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

USER appuser

ENV NODE_ENV=production
ENV PORT=3006

EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3006/health || exit 1

CMD ["node", "services/tutor-svc/dist/index.js"]

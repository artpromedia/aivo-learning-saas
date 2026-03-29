# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:22.22.1-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy workspace packages
COPY packages/brand/package.json packages/brand/
COPY packages/db/package.json packages/db/
COPY packages/events/package.json packages/events/

# Copy app
COPY apps/web/package.json apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/brand/ packages/brand/
COPY packages/db/ packages/db/
COPY packages/events/ packages/events/
COPY apps/web/ apps/web/

# Build dependencies then app
RUN pnpm --filter @aivo/brand build && \
    pnpm --filter @aivo/db build && \
    pnpm --filter @aivo/events build && \
    pnpm --filter @aivo/web build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22.22.1-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

# Copy standalone Next.js output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static apps/web/.next/static
COPY --from=builder /app/apps/web/public apps/web/public

USER appuser

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "apps/web/server.js"]

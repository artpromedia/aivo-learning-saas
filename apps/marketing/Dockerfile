# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/brand/package.json ./packages/brand/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY apps/marketing/package.json ./apps/marketing/package.json

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/brand/ ./packages/brand/
COPY packages/ui/ ./packages/ui/
COPY apps/marketing/ ./apps/marketing/

RUN pnpm --filter @aivo/brand build
RUN pnpm --filter @aivo/ui build
RUN pnpm --filter @aivo/marketing build

# Stage 2: Serve
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/marketing/out /usr/share/nginx/html
COPY apps/marketing/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

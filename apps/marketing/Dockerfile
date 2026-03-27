FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/brand/package.json ./packages/brand/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY apps/marketing/package.json ./apps/marketing/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/brand/node_modules ./packages/brand/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/apps/marketing/node_modules ./apps/marketing/node_modules
COPY . .
RUN pnpm --filter @aivo/brand build
RUN pnpm --filter @aivo/ui build
RUN pnpm --filter @aivo/marketing build

FROM nginx:alpine AS runner
COPY apps/marketing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/marketing/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

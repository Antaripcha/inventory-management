# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /repo

# ---- Install (whole monorepo, so npm workspace symlinks resolve correctly) ----
FROM base AS deps
COPY package.json package-lock.json* turbo.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/client/package.json ./apps/client/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm install --no-audit --no-fund

# ---- Runtime image ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/package.json ./package.json
COPY packages ./packages
COPY apps/server ./apps/server

WORKDIR /repo/apps/server
RUN mkdir -p uploads/products uploads/tmp

EXPOSE 5000
CMD ["node", "src/server.js"]

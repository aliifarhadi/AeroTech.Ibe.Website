# syntax=docker/dockerfile:1.7
# Multi-stage build for the Next.js web app in a pnpm monorepo.
# Produces a small, non-root, standalone runtime image.

ARG NODE_VERSION=22-alpine

# ----------------------------------------------------------------------------
# Base: node + pnpm via corepack (version pinned by the root packageManager field)
# ----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# libc6-compat helps native deps (e.g. sharp) run on Alpine.
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /app

# ----------------------------------------------------------------------------
# Deps: install with a frozen lockfile using only manifests (better layer caching)
# ----------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/domain/package.json ./packages/domain/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/ui/package.json ./packages/ui/
COPY packages/test-utils/package.json ./packages/test-utils/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ----------------------------------------------------------------------------
# Build: compile the web app (standalone output)
# ----------------------------------------------------------------------------
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
# Enable Next.js standalone output for the container image (see next.config.ts).
ENV BUILD_STANDALONE=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
RUN pnpm --filter @aerotech/web build

# ----------------------------------------------------------------------------
# Runner: minimal standalone server, non-root
# ----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone output already contains the traced node_modules and server.js.
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

# Basic container-level healthcheck (k8s probes also hit /api/health).
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]

# Dockerfile de referencia para el frontend Next.js -- usar este patrón en
# cualquier proyecto derivado de este template (deploy en Coolify).
#
# Deliberadamente NO usa `output: 'standalone'` de Next: en un monorepo pnpm
# el file-tracing de Next necesita ver la raíz real del workspace (donde vive
# el store de pnpm) para empaquetar bien las dependencias, y ese
# comportamiento resultó frágil en la práctica -- 3 configuraciones distintas
# de outputFileTracingRoot fallaron de formas distintas en oblivion-ecommerce
# (ver PRs #17, #18, #19). Copiar node_modules explícito, igual que el
# Dockerfile del backend, es una imagen más grande pero determinística.

# ── Stage 1: dependencias ─────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --filter frontend --frozen-lockfile --ignore-scripts

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY apps/frontend ./apps/frontend
RUN mkdir -p apps/frontend/public
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm --filter frontend build

# ── Stage 3: runner (imagen de producción, next start normal) ─────────────────
FROM node:24-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV NODE_ENV=production

RUN addgroup -S orchestry && adduser -S orchestry -G orchestry

COPY --from=builder --chown=orchestry:orchestry /app/node_modules ./node_modules
COPY --from=builder --chown=orchestry:orchestry /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=builder --chown=orchestry:orchestry /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder --chown=orchestry:orchestry /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=orchestry:orchestry /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder --chown=orchestry:orchestry /app/apps/frontend/next.config.js ./apps/frontend/next.config.js

USER orchestry
WORKDIR /app/apps/frontend
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=15s \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["pnpm", "start"]

# Dockerfile de referencia para el backend NestJS -- usar este patrón en
# cualquier proyecto derivado de este template (deploy en Coolify).
#
# Decisiones ya probadas en producción (ver oblivion-ecommerce PRs #15-#17):
# - `--ignore-scripts` en pnpm install: evita ERR_PNPM_IGNORED_BUILDS en el
#   build de Docker (el contexto solo copia el package.json de este app, no
#   el de todo el workspace, y en ese contexto parcial pnpm no siempre
#   respeta `ignoredBuiltDependencies` de pnpm-workspace.yaml).
# - `dist` se copia anidado bajo `apps/backend/`, nunca aplanado a `./dist`:
#   Node solo busca node_modules en directorios ANCESTROS del archivo que
#   hace el require. Si dist se aplana a la raíz pero node_modules queda
#   anidado en apps/backend/node_modules, el require de cualquier paquete
#   hoisteado por pnpm (ej. @nestjs/core) falla con MODULE_NOT_FOUND.
# - Se copian TANTO el node_modules raíz COMO el de la app: bajo pnpm,
#   apps/backend/node_modules es mayormente symlinks relativos apuntando a
#   ../../node_modules/.pnpm/... -- sin el node_modules raíz esos symlinks
#   quedan colgando.
# - `CMD node apps/backend/dist/main.js` asume que `nest build` emite un
#   `dist/` PLANO (main.js en la raíz de dist, no en dist/src/). Eso requiere
#   un `tsconfig.build.json` con `rootDir: "./src"` y `exclude` de test/specs
#   -- sin eso, tsc infiere el rootDir como el ancestro común de src/ y
#   test/ (si test/ también entra a compilación) y anida todo bajo dist/src/,
#   rompiendo este CMD en silencio (el build no falla, solo produce el
#   binario en otro path). Importante: este fix va en tsconfig.build.json,
#   NUNCA en tsconfig.json -- ESLint usa tsconfig.json vía parserOptions.project
#   para lint type-aware, y si ese archivo excluye los *.spec.ts, ESLint
#   rompe con "TSConfig does not include this file" en cada spec.

# ── Stage 1: dependencias ─────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --filter backend --frozen-lockfile --ignore-scripts

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

# ── Stage 3: runner (imagen mínima de producción) ─────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S orchestry && adduser -S orchestry -G orchestry

COPY --from=builder --chown=orchestry:orchestry /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=orchestry:orchestry /app/node_modules ./node_modules
COPY --from=builder --chown=orchestry:orchestry /app/apps/backend/node_modules ./apps/backend/node_modules

USER orchestry
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "apps/backend/dist/main.js"]

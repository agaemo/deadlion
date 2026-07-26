# ── Stage 1: 依存関係インストール ─────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# better-sqlite3 のネイティブコンパイルに必要
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ── Stage 2: ビルド ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# better-sqlite3 がモジュール評価時に data/ を参照するため先に作成
RUN mkdir -p data && corepack enable pnpm && pnpm build

# ── Stage 3: 本番イメージ ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Next.js standalone 出力 (server.js + バンドル済み node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Drizzle マイグレーションファイル (起動時に runMigrations が参照)
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# better-sqlite3 のネイティブモジュール (standalone に含まれないため個別コピー)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# SQLite DB を保持するディレクトリ (ホスト側ボリュームをマウントする場所)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# 起動スクリプト (AUTH_PASSWORD → AUTH_PASSWORD_HASH の自動生成)
COPY --chown=nextjs:nodejs entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

CMD ["./entrypoint.sh"]

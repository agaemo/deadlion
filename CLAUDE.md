# CLAUDE.md

## 起動方法

### Docker（通常）
```bash
make build   # イメージビルド＋起動
make up      # 再ビルドなしで起動
make down    # 停止
make logs    # ログ確認
```
http://localhost:8080 でアクセス。ポートは `.env.local` の `EXTERNAL_PORT` で変更可。

**注意**: `.env.local` の `AUTH_URL` は実際にアクセスするURL（ポート含む）と一致させること。
Docker で起動中に `AUTH_URL=http://localhost:3000` のままだと 3000 へリダイレクトされる。

### ローカル開発（pnpm + mise）
```bash
make dev   # http://localhost:3000
```
pnpm は mise 経由。`~/.local/share/mise/shims/pnpm` にある。

## コマンド

```bash
make test         # vitest（サービス・リポジトリ・認証の単体テスト）
make lint         # oxlint
make typecheck    # 型チェック（tsc --noEmit）
make db-generate  # Drizzle マイグレーション生成
```

## アーキテクチャ概要

```
app/            → Next.js ページ（Server Components）
actions/        → Server Actions（入力検証 + サービス呼び出し）
lib/services/   → ビジネスロジック
lib/db/repositories/  → DB アクセス（interfaces + drizzle 実装）
lib/validation/ → zod スキーマ
components/     → UI コンポーネント
```

依存の向き: `app → actions → services → repositories/interfaces ← drizzle実装`

## 主な注意点

- **認証**: 全 Server Action の冒頭で `requireAuth()` が必要。追加時に漏れないこと。
- **列「未整理」**: 削除不可・リネーム対象外（`isMisc = column.name === "未整理"` で判定）。
- **DBマイグレーション**: スキーマ変更後は `db:generate` → 生成された SQL を `drizzle/` に含めること。
- **カードのドラッグ**: dnd-kit の PointerSensor を使用。JS 経由の PointerEvent シミュレーションでは確認できないため、ブラウザで手動確認が必要。

## テストログイン情報（ローカル開発用）

- ユーザー名: `admin`
- パスワード: `.env.local` の `AUTH_PASSWORD`（初回は `changeme`、ログイン後に変更を求められる）

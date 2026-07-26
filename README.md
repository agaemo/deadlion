# deadlion

プロジェクト管理ツール。カンバンボード・タスク一覧・ガントチャートを一画面で管理できます。

## 機能

- **カンバンボード** — ドラッグ&ドロップでカードを列間移動・並び替え
- **タスク一覧** — 全カードをテーブル形式で表示・ソート
- **ガントチャート** — 納期をタイムライン表示
- カードへのラベル付け・色設定・納期・人月の管理
- シングルユーザー認証（JWT セッション）

## 必要環境

- Docker / Docker Compose

## セットアップ

### 1. 環境変数ファイルを作成

```bash
cp .env.local.example .env.local
```

`.env.local` の `AUTH_URL` をアクセスするURLに合わせてください（デフォルト: `http://localhost:8080`）。

### 2. 起動

```bash
make build   # イメージビルド＋起動
make up      # 再ビルドなしで起動
make down    # 停止
make logs    # ログを表示
```

http://localhost:8080 にアクセスしてください。

初回ログインは `AUTH_USERNAME`（デフォルト: `admin`）/ パスワード `changeme` で入り、パスワード変更が求められます。セッション用シークレットは初回起動時に自動生成され `data/` に保存されます。

> ポートを変更する場合は `.env.local` の `AUTH_URL` と `EXTERNAL_PORT` を合わせて変更してください。

## 環境変数

| 変数名          | 説明                                       | デフォルト              |
| --------------- | ------------------------------------------ | ----------------------- |
| `AUTH_URL`      | アプリにアクセスするURL                    | `http://localhost:8080` |
| `AUTH_USERNAME` | ログインユーザー名                         | `admin`                 |
| `AUTH_PASSWORD` | 初期パスワード（初回ログイン時に強制変更） | `changeme`              |
| `AUTH_SECRET`   | セッション署名用シークレット（自動生成）   | 起動時に自動生成        |
| `EXTERNAL_PORT` | 外部公開ポート                             | `8080`                  |

## データの永続化

SQLite のデータベースファイルとセッションシークレットはホスト側の `./data/` ディレクトリにマウントされます。

### バックアップ

```bash
cp data/app.db data/app.db.bak
```

### 別の環境への移行

`data/app.db` だけコピーすれば、ユーザーアカウント・カンバンデータ・ラベルをすべて引き継げます。

| ファイル            | 内容                       | 移行時                   |
| ------------------- | -------------------------- | ------------------------ |
| `data/app.db`       | ユーザー・カンバン全データ | 必要                     |
| `data/.auth_secret` | セッション署名キー         | 任意（なければ自動生成） |

`.auth_secret` を渡さない場合、既存のログインセッションは無効になりますが、ユーザーがログインし直せばそのまま使えます。

## ローカル開発

Node.js 22 と pnpm が必要です。

```bash
mise exec -- pnpm install
cp .env.local.example .env.local
# .env.local を編集して AUTH_URL=http://localhost:3000 に変更
# AUTH_SECRET に任意の文字列を設定

make dev          # 開発サーバー起動 (http://localhost:3000)
make test         # テスト実行
make lint         # リント
make typecheck    # 型チェック
make db-generate  # マイグレーション生成
```

## ライセンス

[MIT](LICENSE) © 2026 deadlion team

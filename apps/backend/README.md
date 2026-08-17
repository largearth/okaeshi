# Okaeshi Backend

Cloudflare Workers と Hono で動作する API バックエンドです。DB スキーマと migration は Drizzle ORM で管理し、本番データベースには Neon PostgreSQL を使用します。

## Setup

```sh
pnpm install
cp apps/backend/.dev.vars.example apps/backend/.dev.vars
```

`apps/backend/.dev.vars` の `DATABASE_URL` に Neon の **direct connection string** を設定してください。`db:migrate` は session を必要とする migration ツールのため、pooled connection string は使用しません。

```sh
pnpm --filter backend db:generate
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
pnpm --filter backend dev
```

`db:generate` は Drizzle スキーマから SQL migration を生成します。既存の migration を書き換えず、スキーマ変更ごとに新しい migration を生成してください。

## Authentication and password login

認証は Better Auth の ID・パスワード認証を使用します。ログイン ID は `users.email`、パスワードハッシュはその User に紐づく Better Auth の `accounts.password` に保存します。公開登録は許可せず、`db:seed` で投入済みの2 User だけがログインできます。

パスワードの平文は DB・ログ・Git に保存しません。Safari / iCloud キーチェーンは、ログイン後に ID・パスワードを保存・自動入力するブラウザの機能として利用します。

`.dev.vars` に以下を設定します。`BETTER_AUTH_SECRET` は 32 文字以上の高エントロピー値にし、実際の値を Git に追加しないでください。

```dotenv
BETTER_AUTH_URL="http://localhost:8787"
BETTER_AUTH_SECRET="replace-with-a-secret-of-at-least-32-characters"
WEB_ORIGIN="http://localhost:5173"
SEED_GROUP_NAME="Development household"
SEED_USER_1_NAME="Development owner"
SEED_USER_1_EMAIL="owner@example.test"
SEED_USER_1_PASSWORD="replace-with-a-unique-password-of-at-least-12-characters"
SEED_USER_2_NAME="Development member"
SEED_USER_2_EMAIL="member@example.test"
SEED_USER_2_PASSWORD="replace-with-a-unique-password-of-at-least-12-characters"
```

Web アプリは `apps/web/.env` の `VITE_API_ORIGIN` で API の URL を指定します。開発時の既定値は `http://localhost:8787` です。Web と API が別オリジンの場合、`WEB_ORIGIN` と `VITE_API_ORIGIN` を実際の URL に合わせてください。

`db:seed` は `SEED_*` の2ユーザー、パスワードハッシュ、共有 Group、各 Group membership を冪等に投入します。必須の環境変数がない場合は失敗します。実行前に migration を適用してください。

## Neon and Cloudflare configuration

Neon では `development` ブランチを開発用、`production` ブランチを本番用に使用します。

- migration: 対象ブランチの **direct connection string** をローカルの `.dev.vars` に設定して `db:migrate` を実行する
- Worker runtime: 対象ブランチの **pooled connection string** を `DATABASE_URL` として設定する

Cloudflare へデプロイする前に、環境ごとに pooled connection string をシークレットとして登録します。

```sh
pnpm --filter backend exec wrangler secret put DATABASE_URL
```

接続文字列はシークレットです。`.dev.vars`、`.env`、接続文字列を含むログを Git に追加しないでください。

## Commands

- `pnpm --filter backend dev`: Worker をローカル起動する
- `pnpm --filter backend db:generate`: Drizzle schema から migration を生成する
- `pnpm --filter backend db:migrate`: `DATABASE_URL` のDBに未適用 migration を適用する
- `pnpm --filter backend db:check`: migration 履歴の整合性を確認する
- `pnpm --filter backend db:seed`: 開発用の許可ユーザー、共有 Group、所属情報を冪等に投入する
- `pnpm --filter backend test`: スキーマ定義を検証する
- `pnpm --filter backend lint`
- `pnpm --filter backend typecheck`
- `pnpm --filter backend build`

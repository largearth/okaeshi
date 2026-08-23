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

Web アプリは `apps/web/.env` の `VITE_API_ORIGIN` で API の URL を指定します。開発時の既定値は `http://localhost:8787` です。本番では Web と API を同じ Worker で配信し、`BETTER_AUTH_URL`、`WEB_ORIGIN`、`VITE_API_ORIGIN` をすべて `https://okaeshi-app.daxchx-v1.workers.dev` に合わせます。

## REST API and Swagger UI

業務 API は `/api` 配下の REST API として提供します。Better Auth の `/api/auth/*` はログイン、ログアウト、セッション管理の既存契約であり、互換性を維持するため変更しません。

`pnpm --filter backend dev` で Worker を起動し、Web のログイン画面でログインしたあと、同じブラウザで以下を開いてください。

- OpenAPI 3.0 JSON: `http://localhost:8787/api/openapi.json`
- Swagger UI: `http://localhost:8787/api/docs`

Swagger UI は Backend と同一オリジンの session cookie を利用します。ログイン後なら、`Try it out` から保護された業務 API を実行できます。金額は安全な JSON 表現のため、円単位の正整数文字列（例: `"2300"`）で送受信します。

`db:seed` は `SEED_*` の2ユーザー、パスワードハッシュ、共有 Group、各 Group membership を冪等に投入します。必須の環境変数がない場合は失敗します。実行前に migration を適用してください。

## Neon and Cloudflare configuration

Neon では `development` ブランチを開発用、`production` ブランチを本番用に使用します。

- migration: 対象ブランチの **direct connection string** をローカルの `.dev.vars` に設定して `db:migrate` を実行する
- Worker runtime: 対象ブランチの **pooled connection string** を `DATABASE_URL` として設定する

本番 Worker は `okaeshi-app` で、`https://okaeshi-app.daxchx-v1.workers.dev` に公開します。`wrangler.jsonc` は Web の build output（`apps/web/dist`）を同じ Worker の静的アセットとして配信し、React Router の URL は SPA fallback で `index.html` に解決します。`/api/*` は静的アセットより先に Hono Worker へ渡します。

Cloudflare へデプロイする前に、production Neon の pooled connection string と Better Auth の設定を Worker secret として登録します。secret の値は対話入力し、コマンド引数・Git・ログに含めません。

```sh
pnpm --filter backend exec wrangler secret put DATABASE_URL
pnpm --filter backend exec wrangler secret put BETTER_AUTH_URL
pnpm --filter backend exec wrangler secret put BETTER_AUTH_SECRET
```

`BETTER_AUTH_URL` は `https://okaeshi-app.daxchx-v1.workers.dev` を設定します。`DATABASE_URL` は production Neon branch の pooled connection string、`BETTER_AUTH_SECRET` は 32 文字以上の本番専用ランダム値です。`WEB_ORIGIN` と `ENVIRONMENT=production` は `wrangler.jsonc` の非機密 `vars` で設定します。

production build と deploy は以下で実行します。`VITE_API_ORIGIN` は同じ Worker origin として Web bundle に埋め込まれます。

```sh
pnpm --filter backend deploy
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
- `pnpm --filter backend deploy`: production Web build を含めて `okaeshi-app` Worker を deploy

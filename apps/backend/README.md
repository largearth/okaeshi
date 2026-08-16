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
pnpm --filter backend dev
```

`db:generate` は Drizzle スキーマから SQL migration を生成します。既存の migration を書き換えず、スキーマ変更ごとに新しい migration を生成してください。

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
- `pnpm --filter backend test`: スキーマ定義を検証する
- `pnpm --filter backend lint`
- `pnpm --filter backend typecheck`
- `pnpm --filter backend build`

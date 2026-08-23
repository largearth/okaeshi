# Okaeshi Web

Vite と React で作るフロントエンドです。

## Setup

```sh
cp apps/web/.env.example apps/web/.env
pnpm --filter web dev
```

`VITE_API_ORIGIN` には Backend Worker の URL を設定します。開発時の既定値は `http://localhost:8787` です。

## Production

本番では Web と API を単一の Cloudflare Worker で配信します。公開 URL は
`https://okaeshi-app.daxchx-v1.workers.dev` です。

Web の production build は Backend の deploy command から実行します。`build:production` は
`VITE_API_ORIGIN` に同じ Worker origin を埋め込むため、別 origin の Cookie を使いません。

```sh
pnpm --filter backend run deploy
```

Cloudflare への公開前に、Backend の `DATABASE_URL`、`BETTER_AUTH_URL`、
`BETTER_AUTH_SECRET` を Worker secret として登録してください。手順は
`apps/backend/README.md` を参照してください。

ログイン画面では Backend に seed 済みのメールアドレスとパスワードを入力します。Safari の保存確認を承認すると、次回からログイン情報を自動入力できます。

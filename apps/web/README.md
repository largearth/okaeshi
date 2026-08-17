# Okaeshi Web

Vite と React で作るフロントエンドです。

## Setup

```sh
cp apps/web/.env.example apps/web/.env
pnpm --filter web dev
```

`VITE_API_ORIGIN` には Backend Worker の URL を設定します。開発時の既定値は `http://localhost:8787` です。

ログイン画面では Backend に seed 済みのメールアドレスとパスワードを入力します。Safari の保存確認を承認すると、次回からログイン情報を自動入力できます。

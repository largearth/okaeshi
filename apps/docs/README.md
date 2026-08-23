# Okaeshi Docs

プロダクト仕様、設計資料、開発ルールを管理する Astro の静的ドキュメントサイトです。

## Commands

リポジトリ root から実行します。

- `pnpm --filter docs dev`
- `pnpm --filter docs build`
- `pnpm --filter docs lint`
- `pnpm --filter docs typecheck`
- `pnpm --filter docs deploy`

## Content rules

- 文章中心の資料は `src/content/product/` または `src/content/development/` の Markdown に追加する。
- title、description、order の frontmatter を付ける。
- 構成図、ER 図、フローなど、構造を視覚化した方が理解しやすい資料は `src/pages/` と `src/components/` の Astro / HTML / CSS で表現する。
- クライアント JavaScript は、静的表現で不足する場合だけ導入を検討する。

## Cloudflare Workers

Docs は `wrangler.jsonc` の静的アセット Worker として公開します。Workers Builds では GitHub repository を接続し、`develop` を production branch に設定します。

| Setting         | Value                                                                    |
| --------------- | ------------------------------------------------------------------------ |
| Root directory  | `apps/docs`                                                              |
| Build command   | `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter docs build` |
| Deploy command  | `pnpm deploy`                                                            |
| Build variables | `NODE_VERSION=22`, `PNPM_VERSION=9.7.0`, `SKIP_DEPENDENCY_INSTALL=1`     |

初回デプロイ後、この欄に固定 URL を記録します。

```text
Production URL: pending Cloudflare Workers setup
```

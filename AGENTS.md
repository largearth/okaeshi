# リポジトリ方針

## モノレポ

- `pnpm` workspaces と `Turborepo` を使用する。
- `apps/frontend` はフロントエンドアプリ。
- `apps/backend` はバックエンドアプリ。

## スコープ

- 指示された範囲以外は変更しない。
- 関係のないリファクタリングは避ける。
- 既存のアーキテクチャ、命名、フォルダ構成を優先する。

## Skills

- コードまたは設定を変更するタスクでは `agent-workflow` Skill に従う。

## Code Quality

- ローカル確認、Git Hooks、CI、テスト運用の詳細は [Development Docs](/Users/maichi/Desktop/money-app/apps/docs/src/content/development/index.md) を参照する。
- 仕様書・設計資料・開発ルールは `apps/docs/src/content/` にまとめ、ブラウザでは Docs アプリから確認する。
- 環境変数を追加・変更・削除するときは、同じ変更で [環境変数の設定](/Users/maichi/Desktop/money-app/apps/docs/src/pages/development/environment-variables.astro)、対応する `*.example`、アプリごとの README を更新する。

## 文書言語

- 新規・更新する仕様書、設計資料、開発ルール、README、Plan、GitHub Issue、Pull Request 本文は、原則として日本語で記載する。
- API 名、コード、コマンド、固有名詞など、英語のままが明確なものは翻訳しない。
- 既存の英語文書を、今回の変更と無関係に翻訳しない。

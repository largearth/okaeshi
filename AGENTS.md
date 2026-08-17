# リポジトリ方針

## モノレポ

- `pnpm` workspaces と `Turborepo` を使用する。
- `apps/frontend` はフロントエンドアプリ。
- `apps/backend` はバックエンドアプリ。

## スコープ

- 指示された範囲以外は変更しない。
- 関係のないリファクタリングは避ける。
- 既存のアーキテクチャ、命名、フォルダ構成を優先する。

## 検証

- 変更対象の範囲でフォーマットチェックを実行する。
- 変更対象の範囲で lint を実行する。
- 変更に関連するテストを実行する。
- ワークスペース全体にまたがる変更では `pnpm lint`、`pnpm typecheck`、`pnpm build` を使って確認する。

## Code Quality

- ローカル確認、Git Hooks、CI、テスト運用の詳細は [Development Docs](/Users/maichi/Desktop/money-app/apps/docs/src/content/development/index.md) を参照する。
- 仕様書・設計資料・開発ルールは `apps/docs/src/content/` にまとめ、ブラウザでは Docs アプリから確認する。
- 環境変数を追加・変更・削除するときは、同じ変更で [環境変数の設定](/Users/maichi/Desktop/money-app/apps/docs/src/pages/development/environment-variables.astro)、対応する `*.example`、アプリごとの README を更新する。

## Planning

- 実装 Plan は `.plans/` 配下のローカル一時ファイルとして管理する。
- `.plans/` は Git 管理しない。
- 実装完了後に最終版の Plan を GitHub Issue として保存する。
- 詳細な運用は [Planning Workflow](/Users/maichi/Desktop/money-app/apps/docs/src/content/development/planning-workflow.md) を参照する。

## プルリクエスト

- 変更はできるだけ小さく、原則として `1 issue = 1 PR` にする。
- PR の説明欄に関連する Issue を記載する。
- PR で Issue を自動クローズする場合は `Closes #<issue-number>` を使う。

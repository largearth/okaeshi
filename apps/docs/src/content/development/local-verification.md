---
title: ローカル検証手順
description: コミット前に行う共通の確認手順
order: 3
---

# ローカル検証手順

## 目的

変更した内容を、コミット前に同じ手順で確認できるようにする。

## 日常的に使うコマンド

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## フックで自動実行するもの

`pre-commit` では `lint-staged` を実行する。

### format

- 対象ファイルを `prettier --check` で検証する

### lint

- `apps/frontend` の対象ファイルに対して `eslint` を実行する
- `apps/backend` の対象ファイルに対して `eslint` を実行する

### pre-push

- 自動チェックは行わない
- 必要に応じて `typecheck` や `build` を手動で実行する

## 補足

- `format` はリポジトリ全体に対して実行できる
- `lint-staged` はステージされたファイルだけを対象にする
- `test` は現時点では環境未整備のため対象外
- テスト運用の詳細は [テスト運用](/development/test-operations) を参照する
- `pnpm build` で Next の開発キャッシュ由来の型エラーが出る場合は、`apps/frontend/.next` を消してから再実行する

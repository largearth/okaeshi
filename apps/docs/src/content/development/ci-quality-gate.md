---
title: CI 品質ゲート
description: 変更の影響範囲を効率よく検証する CI 方針
order: 4
---

# CI 品質ゲート

## 目的

Pull Request 時に、変更の影響を受ける範囲だけを効率よく検証し、リポジトリ全体の品質を担保する。

## 方針

- `format` はリポジトリ全体を対象に検証する
- `lint` / `typecheck` / `build` は Turborepo の `--affected` を使って対象範囲を絞る
- `test` は現時点ではテストスイート未整備のため、導入時に追加する
- テスト運用の詳細は [テスト運用](/development/test-operations) を参照する

## 実行内容

### format

- `pnpm format:check`

### lint / typecheck / build

- `pnpm exec turbo run lint typecheck build --affected --continue=always --cache-dir=.turbo`

## 補足

- GitHub Actions 上では `--affected` が Pull Request の base branch を基準に差分を判定する
- Turborepo の cache を使うことで、入力に変更がない task の再実行を抑えられる
- `pre-commit` は軽量に保ち、重い確認は CI に寄せる

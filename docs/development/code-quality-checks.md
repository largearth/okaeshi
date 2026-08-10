# コード品質チェック運用

## 方針

- ローカルでは開発速度を優先し、Git Hooks では軽量なチェックのみを自動実行する。
- テストは実装中にローカルで実行し、CI ではリポジトリとしての最終品質を保証する。
- モノレポでは Turborepo を利用し、CI の実行範囲と実行時間を最適化する。

## ローカル

### 開発中

- エディタによるリアルタイムチェックを利用する。
- 対象は `Format`、`Lint`、`TypeScript`。

### Test

- テストは実装中にローカルで実行する。
- 変更している機能については、watch モードなどを利用して継続的にテストする。
- Git Hooks ですべてのテストを強制しない。

### pre-commit

- Husky + lint-staged を使用し、ステージされたファイルのみを対象にする。
- 実行するチェックは `Format` と `Lint`。
- `Typecheck` と `Test` は実行しない。

### pre-push

- 自動チェックは行わない。
- 必要に応じて開発者が `Typecheck` と `Test` を手動実行する。

## CI

- Pull Request 時に `Format`、`Lint`、`Typecheck`、`Test`、`Build` を行う。
- モノレポ全体を毎回チェックするのではなく、Turborepo の `--affected` を利用して変更の影響を受ける Package のみを対象にする。
- Turborepo の cache を利用し、入力に変更がない Task の再実行を抑える。

## 役割分担

```text
開発中
├─ Editor
│  ├─ Format
│  ├─ Lint
│  └─ TypeScript
│
├─ Test
│  └─ 変更している機能をローカルで実行
│
├─ pre-commit
│  └─ staged files
│     ├─ Format
│     └─ Lint
│
├─ pre-push
│  └─ なし
│
└─ Pull Request
   └─ CI
      └─ affected packages
         ├─ Format
         ├─ Lint
         ├─ Typecheck
         ├─ Test
         └─ Build
            ↓
         Turborepo Cache
```

## 原則

- ローカルは高速なフィードバック、CI はリポジトリとしての品質保証を担当する。
- Git Hooks には重い処理を持たせず、開発者の Git 操作を妨げない。
- CI では `Affected` と `Cache` を活用し、必要な範囲に対して確実に品質チェックを行う。

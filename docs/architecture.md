# アーキテクチャ

## 概要

本アプリは、フロントエンドとバックエンドを分離したモノレポ構成を採用する。

プロダクト開発では、仕様を机上で完成させることは困難である。
そのため、まずはプロトタイプを作成し、実際に操作しながら仕様を改善していく。

初期フェーズでは画面実装を優先し、モックデータを利用してプロトタイプを作成する。
バックエンド・データベースは仕様がある程度固まった段階で実装する。

---

# 採用技術

## モノレポ

- pnpm
- pnpm Workspaces
- Turborepo

### 採用理由

- フロントエンド・バックエンドを単一リポジトリで管理するため
- 共通ライブラリを管理しやすくするため
- build・lint・typecheck・dev を一括実行するため
- Turborepoのキャッシュによる開発効率向上

---

## フロントエンド

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## バックエンド

- Hono
- TypeScript
- Cloudflare Workers

---

## データベース

- PostgreSQL
- Prisma

---

## ホスティング

- Cloudflare

---

# 全体構成

```text
monorepo/
├── apps/
│   ├── frontend/
│   └── backend/
│
├── packages/
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

初期段階では `packages` 配下は空とする。

共通化が必要になったタイミングで追加する。

例

```text
packages/
├── shared/
├── validation/
└── config/
```

---

# システム構成

```text
Browser
      │
      ▼
Cloudflare
      │
      ├──────────────┐
      ▼              ▼
 Next.js         Hono API
Frontend         Cloudflare Workers
      │              │
      └────HTTP──────┘
             │
             ▼
      PostgreSQL
```

---

# フロントエンド

## 役割

フロントエンドは以下を担当する。

- 画面表示
- ルーティング
- フォーム入力
- API呼び出し
- クライアント状態管理

## 方針

Next.jsはReactアプリケーションの基盤として利用する。

以下の機能は採用しない。

- API Routes
- Route Handlersによる業務API
- Server Actionsによる業務ロジック

業務処理はすべてバックエンドへ集約する。

```text
Next.js

↓

HTTP API

↓

Hono
```

---

# バックエンド

## 役割

バックエンドは以下を担当する。

- API提供
- 認証・認可
- 入力値検証
- 業務ロジック
- データアクセス
- トランザクション
- 永続化

## 方針

以下の整合性はバックエンドで保証する。

- 支払額と負担額の一致
- グループ所属チェック
- 財布の利用可否
- 請求生成ルール
- 精算状態の更新
- トランザクション整合性

---

# データベース

主要エンティティ

- User
- Group
- GroupMember
- Wallet
- Payment
- Allocation
- Claim
- ClaimItem
- Activity

詳細は

- domain.md
- er.md

を参照する。

---

# 開発方針

## 1. プロトタイプファースト

初期段階では画面を優先して作成する。

```text
仕様書

↓

画面プロトタイプ

↓

実際に操作

↓

違和感を発見

↓

仕様書更新
```

仕様書は「現時点で分かっていること」を整理するためのドキュメントとし、プロトタイプを通して継続的に更新する。

---

## 2. MVPを最優先する

最初から完成版を作らない。

まずは以下の流れを成立させる。

```text
支払い登録

↓

負担額設定

↓

請求作成

↓

請求確認

↓

精算
```

それ以外の機能は必要になってから追加する。

---

## 3. バックエンドは後から実装する

プロトタイプで仕様を確認した後に、

- API
- DB
- 認証
- 永続化

を実装する。

---

# 初期画面

```text
Dashboard
├── Activity
├── Payments
│   ├── New
│   └── Detail
├── Claims
│   ├── List
│   └── Detail
├── Wallets
├── Members
└── Group Settings
```

画面構成はプロトタイプを通して変更してよい。

---

# ディレクトリ構成

```text
apps/
├── frontend/
│   ├── app/
│   ├── features/
│   ├── components/
│   └── lib/
│
└── backend/
    └── src/
        ├── routes/
        ├── services/
        ├── domain/
        ├── repositories/
        └── middleware/
```

packages は必要になった時点で追加する。

---

# 責務分離

## Frontend

- UI
- ユーザー操作
- API通信

---

## Backend

- ビジネスロジック
- ドメインルール
- データ整合性

---

## Database

- 永続化
- データ整合性

---

# 設計原則

- プロトタイプを最優先する
- 仕様は継続的に改善する
- フロントエンドへ業務ロジックを持たせない
- 業務ルールはバックエンドで保証する
- 共通化は必要になってから行う
- 抽象化より変更容易性を優先する
- MVPで価値を検証してから機能を追加する

## 概要

本ドキュメントは、立替・精算管理Webアプリの主要エンティティとリレーションを定義する。

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar name
        varchar avatar_url
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    GROUPS {
        uuid id PK
        varchar name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    GROUP_MEMBERS {
        uuid id PK
        uuid group_id FK
        uuid user_id FK
        varchar role
        timestamp joined_at
        timestamp left_at
    }

    WALLETS {
        uuid id PK
        uuid group_id FK
        uuid owner_user_id FK
        varchar name
        varchar type
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    PAYMENTS {
        uuid id PK
        uuid group_id FK
        uuid paid_by_wallet_id FK
        uuid created_by_user_id FK
        varchar title
        decimal amount
        date paid_at
        varchar memo
        varchar status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    ALLOCATIONS {
        uuid id PK
        uuid payment_id FK
        uuid user_id FK
        decimal amount
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    CLAIMS {
        uuid id PK
        uuid group_id FK
        uuid debtor_user_id FK
        uuid destination_wallet_id FK
        uuid created_by_user_id FK
        decimal total_amount
        varchar status
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    CLAIM_ITEMS {
        uuid id PK
        uuid claim_id FK
        uuid payment_id FK
        uuid allocation_id FK
        decimal amount
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    ACTIVITIES {
        uuid id PK
        uuid group_id FK
        uuid user_id FK
        varchar type
        varchar target_type
        uuid target_id
        varchar message
        timestamp created_at
    }

    GROUPS ||--o{ GROUP_MEMBERS : "メンバーを持つ"
    USERS ||--o{ GROUP_MEMBERS : "グループに所属する"

    GROUPS ||--o{ WALLETS : "財布を管理する"
    USERS o|--o{ WALLETS : "個人財布を所有する"

    GROUPS ||--o{ PAYMENTS : "支払いを管理する"
    WALLETS ||--o{ PAYMENTS : "支払元になる"
    USERS ||--o{ PAYMENTS : "支払いを登録する"

    PAYMENTS ||--o{ ALLOCATIONS : "負担額を持つ"
    USERS ||--o{ ALLOCATIONS : "負担者になる"

    GROUPS ||--o{ CLAIMS : "請求を管理する"
    USERS ||--o{ CLAIMS : "請求を受ける"
    WALLETS ||--o{ CLAIMS : "返済先になる"
    USERS ||--o{ CLAIMS : "請求を作成する"

    CLAIMS ||--|{ CLAIM_ITEMS : "請求明細を持つ"
    PAYMENTS ||--o{ CLAIM_ITEMS : "請求対象になる"
    ALLOCATIONS ||--o| CLAIM_ITEMS : "請求額の根拠になる"

    GROUPS ||--o{ ACTIVITIES : "履歴を持つ"
    USERS ||--o{ ACTIVITIES : "操作を行う"
```

## エンティティ概要

### users

アプリを利用するユーザーを管理する。

### groups

支払い・財布・請求を共有する単位を管理する。

### group_members

ユーザーとグループの所属関係を管理する。

主なロールは以下とする。

- `owner`
- `member`

### wallets

支払元および返済先となる財布を管理する。

財布の種類は以下とする。

- `personal`: 個人財布
- `shared`: グループ共有財布

個人財布の場合は `owner_user_id` を持つ。  
グループ共有財布の場合は `owner_user_id` を持たない。

### payments

財布からお金が出た事実を管理する。

主な状態は以下とする。

- `unallocated`: 未配分
- `allocated`: 配分済み
- `claimed`: 請求済み
- `settled`: 精算済み

### allocations

支払いに対する各ユーザーの負担額を管理する。

同一支払いに紐づく負担額の合計は、支払金額と一致しなければならない。

### claims

ユーザーに対する返済依頼を管理する。

請求は「ユーザーから指定財布への返済依頼」を表し、返済元財布は管理しない。

主な状態は以下とする。

- `unpaid`: 未精算
- `paid`: 精算済み

### claim_items

請求の内訳を管理する。

1件の請求に複数の支払いをまとめられるようにする。

### activities

グループ内で発生した操作履歴を管理する。

主な種類は以下とする。

- `payment_created`
- `allocation_set`
- `claim_created`
- `settlement_completed`

## 制約・業務ルール

1. 支払いは必ず1つの財布から行われる。
2. 負担額は割合ではなく金額で管理する。
3. 1つの支払いに紐づく負担額の合計は、支払金額と一致する。
4. 請求対象はユーザー、返済先は財布とする。
5. 返済元となる財布や返済方法は管理しない。
6. 1件の請求には複数の支払いを含められる。
7. 削除対象は原則として物理削除せず、`deleted_at` または `is_active` で管理する。
8. メンバー脱退後も、過去の支払い・請求・アクティビティは保持する。

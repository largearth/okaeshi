# Planning Workflow

## Overview

実装 Plan はローカルの一時ファイルとして管理し、実装完了後に GitHub Issue として保存する。

Plan をリポジトリへ永続的に保存するのではなく、GitHub Issue と Pull Request を紐付けることで、変更の目的・方針・実装結果を後から追跡できる状態にする。

タスク管理自体は別の仕組みで行い、Plan はタスクへ着手するときに作成する。

## Workflow

### 1. Plan を作成する

タスクに着手するとき、`.plans/` 配下に Plan を作成する。

```text
.plans/
└── xxx.md
```

`.plans/` は Git 管理対象外とする。

```gitignore
.plans/
```

Plan には以下を記載する。

- Goal
- Context
- Scope
- Do
- Don't
- Approach
- Changes
- Verification

### 2. Plan を確認する

実装前に Plan を確認し、実装内容・Scope・方針を整理する。

不明点がある場合は、この段階で整理してから実装を開始する。

### 3. 一時ブランチで実装する

Issue は実装完了後に作成するため、この時点では Issue 番号が存在しない。

そのため、一時的なブランチを作成して実装を開始する。

一時ブランチの名称は永続的に使用しないため、厳密な命名は求めない。

### 4. Plan に沿って実装する

Codex はローカル Plan を参照しながら実装する。

原則として Plan の Scope を超えた変更は行わない。

実装中に新しい判断や方針変更が発生した場合は、必要に応じてローカル Plan を更新する。

Plan は実装中の Working Plan として扱い、常に現在の実装方針と矛盾しない状態を保つ。

### 5. 実装を検証する

Plan の Verification に従って実装結果を確認する。

例:

- 動作確認
- format
- lint
- 関連する test

必要な追加チェックはプロジェクトの開発ルールに従う。

### 6. GitHub Issue を作成する

実装・検証が完了したら、最終的なローカル Plan をもとに GitHub Issue を作成する。

Issue には、実際の実装結果と矛盾しない最終的な Plan を記録する。

Issue はタスク管理を目的とするものではなく、**その変更を行った目的・Scope・実装方針を永続的に残すために使用する。**

### 7. ブランチ名を Issue 番号へ変更する

Issue 作成後、作成された Issue 番号をブランチ名として使用する。

Issue #42 の場合:

```text
42
```

ブランチ名自体には変更内容を記載しない。

変更内容の詳細は GitHub Issue を参照する。

これにより、ブランチ名を考えるコストをなくし、Issue を変更内容の情報源として統一する。

ブランチ名を変更した後、remote へ push する。

### 8. Pull Request を作成する

原則として 1 つの Plan（Issue）につき 1 つの Pull Request を作成する。

Pull Request には対応する Issue を紐付ける。

```md
Closes #42
```

これにより、

```text
Branch 42
   ↓
Pull Request
   ↓
Issue #42
```

という対応関係を作る。

Pull Request が Merge されると、対応する Issue も Close される。

### 9. ローカル Plan を削除する

Issue と Pull Request の作成が完了したら、`.plans/` のローカル Plan を削除する。

Plan は GitHub Issue として永続化されているため、ローカルに残す必要はない。

## Traceability

変更履歴は以下のように辿れる状態を維持する。

```text
Commit
  ↓
Pull Request
  ↓
GitHub Issue
  ↓
Plan
```

ブランチについても Issue 番号と一致するため、

```text
Branch 42
  ↓
Issue #42
```

として直接対応関係を確認できる。

これにより、コードから「何を変更したか」だけでなく、

- なぜ変更したのか
- どこまでを Scope としていたのか
- どのような方針で実装したのか

まで後から確認できる。

## Responsibilities

| 対象         | 役割                                        |
| ------------ | ------------------------------------------- |
| タスク管理   | これから取り組むタスクを管理する            |
| `.plans/`    | 実装中の Working Plan を管理する            |
| GitHub Issue | 完了した実装の目的・Scope・方針を永続化する |
| Branch       | Issue 番号によって作業単位を識別する        |
| Pull Request | 実際の変更内容とレビューを記録する          |
| Commit       | 個々のコード変更を記録する                  |

## Rules

- Plan はタスク着手時に作成する
- `.plans/` は Git 管理しない
- 実装は原則として Plan の Scope 内で行う
- 方針変更があればローカル Plan を更新する
- 実装完了後、最終 Plan を GitHub Issue として保存する
- ブランチ名は GitHub Issue 番号とする
- Issue 作成後、ブランチ名を Issue 番号へ変更してから push する
- 原則として 1 Issue = 1 Pull Request とする
- Pull Request と Issue を必ず紐付ける
- Issue と Pull Request の作成後、ローカル Plan を削除する

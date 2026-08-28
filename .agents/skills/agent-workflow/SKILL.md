---
name: agent-workflow
description: このリポジトリのコードまたは設定を変更するタスクを、調査、必要に応じた計画、実装、検証、自己レビュー、Pull Request 作成まで自律的に進める。
---

# Agent workflow

本 Skill は変更タスクの一本道を定義するオーケストレーターである。各工程の詳しい手順は、該当する専門 Skill とリポジトリのドキュメントに委譲する。

人間からは実装手順ではなく Problem / Goal を受け取る。安全に一意に決められない重要な仕様判断、または安全な実装・検証を妨げる問題は `blocked-road-maintenance` に従う。

## Workflow

### 1. Understand

Problem / Goal を理解する。必要に応じて Product Specs、コード、テスト、Skills、Feature Map、Git history を確認する。実装方法を質問する前に、必要な情報を自力で調査する。

### 2. Plan if needed

変更範囲と解決方法が明確な局所的タスクは、そのまま実装する。複数機能・複数レイヤーにまたがる、または変更前に整理が必要なタスクでは `.plans/` に Working Plan を作成する。

Plan は Agent 自身の整理とスコープ境界のためのものであり、通常は人間の承認を待たない。Plan の形式、ライフサイクル、Issue・ブランチ・PR の対応は [Planning Workflow](../../../apps/docs/src/content/development/planning-workflow.md) に従う。Plan を作成した場合、実装中は `scope-guard` Skill に従う。

### 3. Implement

Problem / Goal と必要に応じて作成した Plan に必要な変更だけを行う。既存の設計、命名、フォルダ構成を優先し、推測で仕様を追加しない。作業中に発見した別問題は勝手に修正しない。

### 4. Verify

`verification` Skill に従い、変更内容に必要な検証と証跡の取得を行う。検証できない場合や、検証に必要な環境・データ・操作方法が不足している場合は `blocked-road-maintenance` に従う。

### 5. Review own changes

Pull Request の前に `git diff` と `git status` を確認する。Problem / Goal 以外の変更、不必要なコード・コメント・一時ファイルが残っていないこと、および検証が完了していることを確かめる。

### 6. Deliver

変更タスクは、次をすべて満たして初めて完了する。

1. ブランチを作成する。
2. commit する。
3. remote へ push する。
4. Pull Request を作成する。

実装完了後に作成する Issue、ブランチ名、Pull Request とローカル Plan の対応は [Planning Workflow](../../../apps/docs/src/content/development/planning-workflow.md) に従う。PR 本文には What、Why、Verification、Evidence と、必要に応じて残るリスク・判断・関連する Problem / Plan を日本語で記載する。`pr-evidence` Skill に従い、ユーザー向け画面または操作フローを変更した PR には、実際に表示できるスクリーンショットを本文へインラインで添付し、作成後に表示を確認する。

外部への変更に必要な権限がユーザーから明示または暗黙に与えられていない場合は、実装と検証を完了した時点で権限を求める。完了時は PR URL と重要な検証結果を簡潔に報告する。

## Blocked

途中で安全に進められなくなった場合は、通常の質問で作業を継続しない。`blocked-road-maintenance` Skill に従って blocked report を作成し、原因・必要な整備・再開条件を記録してタスクを停止する。

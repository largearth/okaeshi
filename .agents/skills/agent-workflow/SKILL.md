---
name: agent-workflow
description: このリポジトリのコードまたは設定変更を、Task分類、Playbook選択、実装、検証、Evidence、Pull RequestまたはBlocked Reportまで一貫して進める。
---

# Agent workflow

コードまたは設定変更は、個別の判断で工程を省略せず、このPipelineを通す。HumanからはProblem / Goal / Done conditionを受け取り、正常時はPR URL、安全に完了できない場合はBlocked Reportを返す。

## Pipeline

```text
Human Input
→ Router
→ Selected Playbook
→ Stages
→ Verification
→ Evidence
→ Pull Request
```

どの工程でも安全に次へ進めない場合は `blocked-road-maintenance` に遷移して停止する。

## 1. Route

実装前に [references/pipeline.json](references/pipeline.json) を読み、Taskを分類する。Routerではコードや設定を変更しない。

分類結果を次の形で保持する。

```text
type: <task type>
reason: <入力と既存情報に基づく理由>
selected_playbook: <playbook or none>
```

- `small-change`: 変更範囲と解決方法が明確な局所変更
- `bug-fix`: 既存の振る舞いが期待結果と異なり、再現確認が必要な修正
- `feature`: 新しい振る舞いを追加する変更
- `complex-change`: 複数機能・複数レイヤー・重要設計へまたがる変更
- `investigation`: 変更依頼の中で実装方針を決めるための調査が中心となる変更。調査結果だけを求める非変更タスクはこのSkillの対象外
- `blocked`: 重要な仕様判断を安全に一意に決められず、Playbookを開始できない状態

`feature`、`complex-change`、`investigation` は最小構成では `complex-change` Playbookへ渡す。安全に一意に分類できない場合は、近い分類を推測せず `blocked` とする。

## 2. Execute the selected playbook

[references/stage-contracts.md](references/stage-contracts.md) を読み、`pipeline.json` に定義された順番でStageを実行する。各Stageは自分の責務だけを行い、Outputを次のStageへ渡す。

- Playbookに含まれないStageは実行せず、Pipeline Traceへskip理由を残す。
- `design` を実行する場合は [Planning Workflow](../../../apps/docs/src/content/development/planning-workflow.md) に従って `.plans/` にWorking Planを作り、実装中は `scope-guard` に従う。通常はHuman approvalを待たない。
- `verification` は `verification` Skillへ委譲する。
- ユーザー向け画面または操作フローを変更した場合のEvidenceは `pr-evidence` Skillへ委譲する。
- Stageの途中で発見した別問題を修正したり、次のStageの責務を先取りしたりしない。

## 3. Blocked

Router、全Stage、DeliveryのどこからでもBlockedへ遷移できる。重要なProduct判断、環境、データ、権限、操作手順、検証能力が不足し、安全に進めない場合は通常の質問でPipelineを継続しない。

`blocked-road-maintenance` に従ってBlocked Reportと停止時点までのPipeline Traceを残し、作業を停止する。未検証の実装を正常終了としてDeliveryへ進めない。

## 4. Deliver

Delivery前に `git diff` と `git status` を確認し、スコープ外変更、不必要なファイル、未完了の検証がないことを自己レビューする。

[references/delivery-surfaces.md](references/delivery-surfaces.md) を読み、LocalまたはCodex Cloudの実行Surfaceに合うDelivery経路を選ぶ。[Planning Workflow](../../../apps/docs/src/content/development/planning-workflow.md) に従ってIssue、Issue番号のブランチ、commit、push、Pull Requestを作成する。PR本文には日本語で `What`、`Why`、`Verification`、`Evidence` と関連Issueを記載する。

次をすべて満たし、PR URLが存在する場合だけ正常終了とする。

- Selected Playbookの全必須Stageが完了している
- Verification verdictが `pass`
- EvidenceがPRへ渡せる形で整理されている
- Self review、commit、push、Pull Request作成が完了している

## 5. Report the pipeline trace

正常終了の報告またはBlocked Reportで、最低限次を確認できるようにする。

```text
Input
Task type + reason
Selected playbook
Visited stages
Skipped stages + reason
Final state: completed | blocked
PR URL | Blocked Report path
```

正常終了の最終成果物はPR URL、異常終了の最終成果物はBlocked Reportであり、実装完了だけをDoneとしない。

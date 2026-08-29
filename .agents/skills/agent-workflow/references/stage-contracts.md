# Stage contracts

各Stageは以下のInputを受け取り、責務の範囲だけを処理し、Outputを次のStageへ渡す。安全にOutputを作れない場合は、後続Stageへ進まず `blocked-road-maintenance` へ遷移する。

## Router

- Input: Human Input、常時適用ルール
- Responsibility: Task typeを判断し、Playbookを選択する。調査・実装は行わない
- Output: `type`、`reason`、`selected_playbook`

## Understand

- Input: Human Input、分類結果
- Responsibility: Problem / Goal、期待する振る舞い、Done conditionを整理し、必要な仕様、コード、テスト、履歴を調べる
- Output: `goal`、`expected_behavior`、`done_condition`、`relevant_context`

## Reproduce

`bug-fix` だけで実行する。

- Input: Understand Output
- Responsibility: 変更前の不具合を再現し、観測可能な失敗条件を特定する。修正は行わない
- Output: `reproduction_steps`、`observed_failure`、`reproduction_evidence`

再現できず原因や正しさを判断できない場合は、推測でBuildへ進まない。既存のテストや根拠から安全に問題を特定できる場合は、その根拠と再現を代替した理由をTraceへ残す。

## Design

`complex-change` だけで実行する。

- Input: Understand Output
- Responsibility: Scope、実装方針、変更手順、Verification方法を整理し、Planning Workflowに沿ってWorking Planを作る
- Output: `scope`、`implementation_steps`、`verification_plan`、`plan_path`

Planは通常Human approvalを待たない。安全に一意に決められない重要な仕様判断が残る場合はBlockedとする。

## Build

- Input: Understand Output、必要な場合はReproduce / Design Output
- Responsibility: ProblemとPlanに必要なコードまたは設定だけを変更する
- Output: `changed_files`、`implementation_summary`

スコープ外の修正、無関係なリファクタリング、Verificationの代行を行わない。

## Verification

- Input: Done condition、変更内容、Verification plan
- Responsibility: `verification` Skillに従い、期待する振る舞いを反証できる品質チェックと実動作確認を行う。実装の追加や修正は行わない
- Output: `verdict` (`pass` / `fail` / `blocked`)、`checks`、`evidence`

`fail` の場合はBuildへ戻って原因に必要な修正だけを行い、Verificationを再実行する。必要な環境や能力がなく確認できない場合は `blocked` とし、EvidenceやDeliveryを省略して正常終了してはならない。

## Evidence

- Input: Verification Output
- Responsibility: Reviewerが変更の正しさを判断できる最小限の証拠を、PRへ渡せる形に整理する。新しい実装や未実施の検証を追加しない
- Output: `evidence_bundle`

実行したtest、build、操作結果、スクリーンショット、console / network、API / DB状態、関連diffなどから、変更の主張を直接裏付けるものを選ぶ。UI変更は `pr-evidence` Skillへ委譲する。

## Delivery

- Input: Verification verdict `pass`、Evidence bundle、最終差分
- Responsibility: [delivery-surfaces.md](delivery-surfaces.md) で実行Surfaceを判定し、Self review、Issue作成、Issue番号ブランチへの変更、commit、push、PR作成をPlanning Workflowに沿って行う
- Output: `issue_url`、`commit`、`branch`、`pr_url`

外部操作に必要な権限または認証がなくDeliveryを完了できない場合は、通常メッセージだけで終了せずBlocked Reportを作る。

## Pipeline trace

Stageを完了またはskipするたび、最終報告用に次を更新する。

- `input`: Human Inputの要約
- `task_type`: 分類と理由
- `selected_playbook`
- `visited_stages`: 完了または停止した順番と結果
- `skipped_stages`: Stageと具体的な理由
- `final_state`: `completed` または `blocked`
- `result`: PR URLまたはBlocked Report path

Playbookに含まれないStageはskipとして記録する。Stage内で停止した場合は、そのStageをvisitedに含めて停止理由を記録する。

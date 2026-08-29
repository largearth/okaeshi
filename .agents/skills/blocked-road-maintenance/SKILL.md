---
name: blocked-road-maintenance
description: 実装または検証を安全に完了できない障害を、再開可能な blocked report と開発環境の整備提案に変換してタスクを停止する。
---

# Blocked road maintenance

重要な仕様判断を安全に一意に決められない、または実装・検証に必要な環境、データ、権限、操作手順が不足しているときに使う。目的は人間に作業を代行させることではなく、次回から Agent が自律的に通れる道を整備することである。

## Stop and record

推測で実装・検証を進めず、通常の質問でタスクを継続しない。`.ai/blocked/<timestamp>-<task-slug>.md` に次を含むBlocked Reportを作成してタスクを停止する。

- **Blocked at:** 停止した工程と、完了済みの作業
- **Cause type:** `product-decision`、`environment`、`data`、`permission`、`capability`、`procedure`、`transient-failure` のうち最も近い分類
- **Cause:** 再現可能な原因、観測したエラー、または決められない仕様判断
- **Impact:** 正しさ・安全性を確認できない理由
- **Missing capability:** Pipelineを止めた不足。該当しない場合は `なし`
- **Required maintenance:** Agent が次回自律的に進めるために必要な環境、データ、権限、ドキュメント、Skill、または自動化
- **Suggested improvement:** 同じ停止を減らすための最小の整備案
- **Resume condition:** 再開可能になる具体的な条件
- **Evidence:** コマンド出力、ログ、スクリーンショットなど、実際に得られた根拠
- **Pipeline trace:** Input、Task typeと理由、Playbook、Visited / Skipped Stages、Final state `blocked`、このReportのpath

原因が一時的な失敗か、設定・能力の恒久的な不足かを区別する。安全な再試行で解決しない恒久的な不足は、整備対象として具体化する。未確認の実装や検証を完了扱いにしない。

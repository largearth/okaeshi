---
name: pr-evidence
description: ユーザー向け画面または操作フローを変更した Pull Request に、原則として実際に表示できるスクリーンショットを添付し、本番実機でしか確認できない低リスク UI は例外を記録して Reviewer が判断できる Evidence にする。
---

# PR evidence

画面または操作フローを変更した Pull Request では、ローカルに残したスクリーンショットや文章だけを Evidence として扱わない。Reviewer が PR を開いたとき、変更後の状態を画像で直接確認できることを完了条件にする。

## Attach evidence

`verification` で取得した、変更を直接示すスクリーンショットを PR 本文の `## Evidence` に Markdown 画像としてインライン添付する。画像の前後には、確認した操作シナリオと、その画像が示す結果を簡潔に記載する。

- 通常の画面変更では、主要な成功状態を示す画像を添付する。
- 削除・取消などの破壊的操作を変更した場合は、実行後に対象が期待どおり削除・更新された状態を示す画像を添付する。確認ダイアログを変更した場合は、必要に応じてその状態も添付する。
- 画像には機密情報、実在する不要な個人情報、認証情報を含めない。

画像は GitHub 上の PR で表示できる添付またはアクセス可能な URL を用いる。ローカルパス、ローカルホスト URL、PR Reviewer がアクセスできない URL は添付済み Evidence とみなさない。

## Production device exception

本番環境でしか確認できない実機・OS 固有の低リスク UI または表示挙動は、`verification` Skill の本番実機確認の例外条件をすべて満たす場合に限り、変更後スクリーンショットなしで Evidence Stage を通過できる。PR の例外記録は、本番反映後に確認する意図を Reviewer へ伝えるために必須とする。

例外を適用する場合、PR の `## Evidence` に `### 本番実機確認の例外` を設け、次をすべて記録する。

- 例外を適用した事実
- production 前に実機確認できない具体的な理由
- production 前に確認済みの代替 Evidence
- 未確認の挙動と、実機確認済みではないこと
- 本番反映後の具体的な確認手順

例外は screenshot の欠落を隠すために使わず、未確認の production check を Reviewer が判断できる記録として残す。セキュリティ、認証、権限、データ整合性、金銭計算、破壊的操作、migration、および production 前に再現可能な変更には適用しない。

## Confirm delivery

PR を作成または更新した後、PR 本文を開いて画像がインライン表示され、説明と対応していることを確認する。Production device exception を適用した場合は、代わりに必須メモが PR 本文へ保存されていることを確認する。画像のアップロード、PR 本文への添付、表示確認、または例外メモの保存確認のいずれか必要なものを完了できない場合は、PR を Evidence 完備として扱わず `blocked-road-maintenance` Skill に従う。

## Non-visual changes

画面や操作フローを変更しない PR にはスクリーンショットを強制しない。その場合も `Verification` と `Evidence` に、実行結果・ログ・API / DB 状態など、変更を直接裏付ける根拠を記載する。

# Delivery surfaces

Delivery前に実行Surfaceを判定する。Repository内のWorkflow、Verification、Evidence契約は共通だが、GitHubへの認証とPR作成経路はLocalとCodex Cloudで分ける。

## Local Codex

Projectが信頼されていることを確認し、`.codex/config.toml` と `.codex/rules/github-delivery.rules` を使用する。GitHub tokenや認証情報をRepositoryへ保存しない。

Deliveryは保護された次のscriptだけで行う。

```text
sh .codex/scripts/create-github-issue.sh <title> <plan-file>
git branch -m <issue-number>
git add / git commit
sh .codex/scripts/push-issue-branch.sh
sh .codex/scripts/create-github-pr.sh <issue-number> <title> <pr-body-file>
```

scriptはRepositoryを `largearth/okaeshi`、push先を `origin`、PR baseを `develop`、branchをIssue番号形式に固定する。force push、Issue削除、PR merge、他Repositoryへの操作に置き換えない。

## Codex Cloud

Project-local sandbox設定とRulesをGitHub権限として扱わない。Codex Cloudは隔離ContainerへRepositoryをcheckoutし、Cloud Environmentと接続済みGitHub Repositoryの権限で動作する。

1. Repositoryの `AGENTS.md` とSkillに従って実装、Verification、Evidence、Self reviewを完了する。
2. PR title/bodyへ渡す `What`、`Why`、`Verification`、`Evidence` を準備する。
3. 接続済みRepositoryのCodex CloudネイティブPR作成経路を使用する。
4. PR URLが返った場合だけPipelineを `completed` とする。

Cloud Agent実行中にGitHub tokenをEnvironment variableへ保存したり、Local用scriptを認証回避として使ったりしない。現在のCloud taskでネイティブPR作成を実行できない場合は、PR-ready diffを正常終了と偽らずDeliveryでBlocked Reportを残す。

Codex Cloudの利用前に、Cloud設定でGitHubの `largearth/okaeshi` を接続し、このRepository用Environmentを作成する。依存関係、setup script、Agent internet accessはCloud Environment側で管理する。

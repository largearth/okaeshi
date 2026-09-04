---
title: Okaeshi Agent Control
description: AI AgentがローカルのWebアプリを操作して検証するためのCLI
order: 6
---

# Okaeshi Agent Control

`okaeshi-control` は、AI Agent が同じ Playwright BrowserContext を複数の CLI 呼び出しで操作するためのローカル専用ツールです。Phase 1 では、検証用の出金を 1 件作成し、保存後の画面を snapshot とスクリーンショットで確認する最小の操作だけを提供します。

## 起動

初回だけ Chromium をインストールします。

```sh
pnpm verify:install-browser
```

Web と Backend、Agent Control daemon をそれぞれ前景起動します。

```sh
pnpm dev
```

```sh
pnpm okaeshi-control:daemon
```

daemon は `127.0.0.1:4317` だけで待ち受けます。Agent Control は `ENVIRONMENT=development` の場合だけsessionを作成でき、productionでは利用できません。

## 出金作成シナリオ

`new-session` は既存の出金作成fixtureを冪等に投入し、前回の同名出金を削除してから、Better Auth APIで検証ユーザーのsessionを作成します。

```sh
pnpm okaeshi-control new-session
pnpm okaeshi-control goto /home
pnpm okaeshi-control click --role button --name "立て替えたお金を記録する"
pnpm okaeshi-control snapshot
pnpm okaeshi-control type --label 金額 --value 1200
pnpm okaeshi-control select --label "出金元の財布" --option "E2E 出金作成用財布"
pnpm okaeshi-control type --label 用途 --value "E2E 出金作成"
pnpm okaeshi-control click --role button --name "出金を記録する" --wait-for-url /records
pnpm okaeshi-control snapshot
pnpm okaeshi-control screenshot
```

保存後の snapshot で `/records`、用途 `E2E 出金作成`、金額 `¥1,200` を確認します。スクリーンショットは `artifacts/agent/screenshots/` にfull-pageで保存されます。

全CLIは成功時に `ok: true`、失敗時に `ok: false` とエラーコードをJSONで返します。fixture commandの内部エラーとstderrは `artifacts/agent/logs/agent-control-daemon.log` に記録され、CLIには公開されません。CLI側では安全な定型メッセージを持つ `SEED_FAILED` に正規化されます。

## Phase 1の制約

- `select` はnative `<select>` だけを対象にし、Playwrightの `selectOption` を使用します。
- custom combobox、listbox、独自の選択UIは後続Phaseで対応します。
- `doctor`、`info`、`console`、network、trace、cleanup、並列sessionは後続Phaseの対象です。
- `goto` は `/` で始まるOkaeshiと同一originのpathだけを受け付けます。

## 固定検証

Web と Backend はPlaywright設定から起動され、daemonとCLIを通した一連の操作が実行されます。

```sh
pnpm verify:agent-control-payment-create
```

#!/usr/bin/env node

import { Command, CommanderError } from "commander";

import { requestDaemon } from "./client.js";
import { failure, type AgentControlResponse } from "./response.js";

const program = new Command();

program
  .name("okaeshi-control")
  .description("OkaeshiのローカルブラウザをAgentから操作する")
  .showHelpAfterError(false)
  .exitOverride()
  .configureOutput({
    writeErr: () => undefined,
  });

program
  .command("new-session")
  .description("検証fixtureと認証済みbrowser contextを作る")
  .action(async () => {
    await run(() => requestDaemon("/session", { method: "POST" }));
  });

program
  .command("goto")
  .argument("<path>")
  .description("現在のpageをOkaeshi内のpathへ移動する")
  .action(async (path: string) => {
    await run(() => requestDaemon("/goto", { body: { path }, method: "POST" }));
  });

program
  .command("snapshot")
  .description("現在の画面の主要なsemantic elementを取得する")
  .action(async () => {
    await run(() => requestDaemon("/snapshot"));
  });

program
  .command("type")
  .requiredOption("--label <label>")
  .requiredOption("--value <value>")
  .description("labelで指定したinputまたはtextareaへ入力する")
  .action(async (options: { label: string; value: string }) => {
    await run(() => requestDaemon("/type", { body: options, method: "POST" }));
  });

program
  .command("select")
  .requiredOption("--label <label>")
  .requiredOption("--option <option>")
  .description("labelで指定したnative selectのoptionを選択する")
  .action(async (options: { label: string; option: string }) => {
    await run(() =>
      requestDaemon("/select", { body: options, method: "POST" }),
    );
  });

program
  .command("click")
  .requiredOption("--role <role>")
  .requiredOption("--name <name>")
  .option("--wait-for-url <path>")
  .description("roleとaccessible nameで指定したelementをclickする")
  .action(
    async (options: { name: string; role: string; waitForUrl?: string }) => {
      await run(() =>
        requestDaemon("/click", {
          body: {
            name: options.name,
            role: options.role,
            waitForUrl: options.waitForUrl,
          },
          method: "POST",
        }),
      );
    },
  );

program
  .command("screenshot")
  .description("現在のpageをfull-page screenshotとして保存する")
  .action(async () => {
    await run(() => requestDaemon("/screenshot", { method: "POST" }));
  });

async function run<T extends object>(
  request: () => Promise<AgentControlResponse<T>>,
): Promise<void> {
  const response = await request();
  process.stdout.write(`${JSON.stringify(response)}\n`);
  if (!response.ok) process.exitCode = 1;
}

program.parseAsync().catch((error: unknown) => {
  const response =
    error instanceof CommanderError
      ? failure("INVALID_ARGUMENT", error.message)
      : failure("INTERNAL_ERROR", "CLIの実行に失敗しました。");
  process.stdout.write(`${JSON.stringify(response)}\n`);
  process.exitCode = 1;
});

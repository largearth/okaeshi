import {
  execFile,
  spawn,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const repoRoot = process.cwd();
let daemon: ChildProcessWithoutNullStreams;

test.beforeAll(async () => {
  daemon = await startDaemonProcess();
});

test.afterAll(async () => {
  if (!daemon.pid || daemon.exitCode !== null) return;
  process.kill(-daemon.pid, "SIGTERM");
  await new Promise<void>((resolve) => daemon.once("exit", () => resolve()));
});

test("Agent Controlだけで出金を1件作成しsnapshotとscreenshotを取得できる", async () => {
  const session = await runCli(["new-session"]);
  expect(session).toMatchObject({ ok: true, url: "/home" });

  expect(await runCli(["goto", "/home"])).toMatchObject({
    ok: true,
    url: "/home",
  });
  expect(
    await runCli([
      "click",
      "--role",
      "button",
      "--name",
      "立て替えたお金を記録する",
    ]),
  ).toMatchObject({ ok: true, url: "/home" });

  let formSnapshot: Record<string, unknown> = {};
  await expect
    .poll(
      async () => {
        formSnapshot = await runCli(["snapshot"]);
        return JSON.stringify(formSnapshot);
      },
      { timeout: 10_000 },
    )
    .toContain("出金元の財布");
  expect(JSON.stringify(formSnapshot)).toContain("出金を記録する");
  expect(JSON.stringify(formSnapshot)).toContain("金額");

  expect(
    await runCli(["type", "--label", "金額", "--value", "1200"]),
  ).toMatchObject({ ok: true, label: "金額", value: "1,200" });
  expect(
    await runCli([
      "select",
      "--label",
      "出金元の財布",
      "--option",
      "E2E 出金作成用財布",
    ]),
  ).toMatchObject({
    ok: true,
    label: "出金元の財布",
    option: "E2E 出金作成用財布",
  });
  expect(
    await runCli(["type", "--label", "用途", "--value", "E2E 出金作成"]),
  ).toMatchObject({
    ok: true,
    label: "用途",
    value: "E2E 出金作成",
  });
  expect(
    await runCli([
      "click",
      "--role",
      "button",
      "--name",
      "出金を記録する",
      "--wait-for-url",
      "/records",
    ]),
  ).toMatchObject({ ok: true, url: "/records" });

  let recordsSnapshot: Record<string, unknown> = {};
  await expect
    .poll(
      async () => {
        recordsSnapshot = await runCli(["snapshot"]);
        return JSON.stringify(recordsSnapshot);
      },
      { timeout: 10_000 },
    )
    .toContain("E2E 出金作成");
  const serializedSnapshot = JSON.stringify(recordsSnapshot);
  expect(serializedSnapshot).toContain("¥1,200");
  expect(recordsSnapshot).toMatchObject({ ok: true, url: "/records" });

  const matchingRecords = (
    recordsSnapshot.elements as Array<{ name: string; role: string }>
  ).filter(
    (element) =>
      element.role === "link" && element.name.includes("E2E 出金作成"),
  );
  expect(matchingRecords).toHaveLength(1);

  const screenshot = await runCli(["screenshot"]);
  expect(screenshot).toMatchObject({ ok: true, url: "/records" });
  const screenshotPath = path.join(repoRoot, String(screenshot.path));
  expect((await stat(screenshotPath)).size).toBeGreaterThan(0);
});

function runCli(arguments_: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    execFile(
      "pnpm",
      ["--silent", "okaeshi-control", ...arguments_],
      { cwd: repoRoot },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `okaeshi-control failed: ${error.message}\nstdout: ${stdout}\nstderr: ${stderr}`,
            ),
          );
          return;
        }
        const jsonLine = stdout
          .trim()
          .split("\n")
          .findLast((line) => line.trim().startsWith("{"));
        if (!jsonLine) {
          reject(new Error(`JSON response was not found in stdout: ${stdout}`));
          return;
        }
        resolve(JSON.parse(jsonLine) as Record<string, unknown>);
      },
    );
  });
}

function startDaemonProcess(): Promise<ChildProcessWithoutNullStreams> {
  const child = spawn("pnpm", ["--silent", "okaeshi-control:daemon"], {
    cwd: repoRoot,
    detached: true,
    stdio: ["pipe", "pipe", "pipe"],
  });

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Agent Control daemon startup timed out.\nstdout: ${stdout}\nstderr: ${stderr}`,
        ),
      );
    }, 30_000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (
        stdout
          .split("\n")
          .some((line) => line.startsWith("{") && line.includes('"ok":true'))
      ) {
        clearTimeout(timeout);
        resolve(child);
      }
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      clearTimeout(timeout);
      reject(
        new Error(
          `Agent Control daemon exited before ready: code=${code} signal=${signal}\nstdout: ${stdout}\nstderr: ${stderr}`,
        ),
      );
    });
  });
}

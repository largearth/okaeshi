import { createServer, type Server } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { BrowserManager } from "./browser-manager.js";
import type { AgentControlConfig } from "./config.js";

describe("BrowserManager", () => {
  let apiServer: Server;
  let webServer: Server;
  let apiOrigin: string;
  let webOrigin: string;
  let artifactRoot: string;

  beforeAll(async () => {
    artifactRoot = await mkdtemp(path.join(os.tmpdir(), "okaeshi-control-"));
    apiServer = createServer((_request, response) => {
      response.writeHead(200, {
        "content-type": "application/json",
        "set-cookie": "session=test; Path=/; HttpOnly",
      });
      response.end("{}");
    });
    webServer = createServer((_request, response) => {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(`<!doctype html>
        <html><body>
          <h1>Test page</h1>
          <label>金額<input value=""></label>
          <label>出金元の財布<select><option>財布A</option><option>財布B</option></select></label>
          <div role="combobox" aria-label="custom selector">custom</div>
          <a href="/records">E2E 出金作成 ¥1,200</a>
        </body></html>`);
    });
    apiOrigin = await listen(apiServer);
    webOrigin = await listen(webServer);
  });

  afterAll(async () => {
    await Promise.all([close(apiServer), close(webServer)]);
    await rm(artifactRoot, { force: true, recursive: true });
  });

  it("同じsessionのpageを操作し、new-sessionでcontextを初期化する", async () => {
    const manager = new BrowserManager(
      testConfig({ apiOrigin, artifactRoot, webOrigin }),
    );

    try {
      const first = await manager.createAuthenticatedSession();
      expect(first.url).toBe("/home");
      expect(await manager.typeByLabel("金額", "1200")).toBe("1200");
      expect(await manager.selectByLabel("出金元の財布", "財布B")).toBe(
        "財布B",
      );

      const snapshot = await manager.snapshot();
      expect(snapshot.elements).toEqual(
        expect.arrayContaining([
          { name: "Test page", role: "heading" },
          { name: "金額", role: "textbox", value: "1200" },
          {
            name: "出金元の財布",
            role: "combobox",
            value: "財布B",
          },
          { name: "E2E 出金作成 ¥1,200", role: "link" },
        ]),
      );

      const second = await manager.createAuthenticatedSession();
      expect(second.session).not.toBe(first.session);
      expect((await manager.snapshot()).elements).toContainEqual({
        name: "金額",
        role: "textbox",
        value: "",
      });
    } finally {
      await manager.stop();
    }
  }, 20_000);

  it("selectはnative select以外を拒否する", async () => {
    const manager = new BrowserManager(
      testConfig({ apiOrigin, artifactRoot, webOrigin }),
    );
    try {
      await manager.createAuthenticatedSession();
      await expect(
        manager.selectByLabel("custom selector", "anything"),
      ).rejects.toMatchObject({
        code: "INTERACTION_FAILED",
        message: "Phase 1のselectはnative <select>だけを操作できます。",
      });
    } finally {
      await manager.stop();
    }
  });
});

function testConfig(
  overrides: Pick<
    AgentControlConfig,
    "apiOrigin" | "artifactRoot" | "webOrigin"
  >,
): AgentControlConfig {
  return {
    ...overrides,
    daemonHost: "127.0.0.1",
    daemonLogPath: path.join(overrides.artifactRoot, "daemon.log"),
    daemonPort: 4317,
    environment: "development",
    repoRoot: overrides.artifactRoot,
    verificationPassword: "password",
    verificationUserEmail: "verification@example.test",
  };
}

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("missing port");
  return `http://127.0.0.1:${address.port}`;
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

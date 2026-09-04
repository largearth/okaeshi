import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { pathToFileURL } from "node:url";

import { BrowserManager } from "./browser-manager.js";
import { loadAgentControlConfig, type AgentControlConfig } from "./config.js";
import { AgentControlError, asAgentControlError } from "./errors.js";
import { createDaemonLogger, type DaemonLogger } from "./logger.js";
import { failure, success } from "./response.js";
import { createSeedPaymentCreate, type SeedPaymentCreate } from "./seed.js";

type BrowserManagerContract = Pick<
  BrowserManager,
  | "clickByRole"
  | "createAuthenticatedSession"
  | "goto"
  | "hasSession"
  | "screenshot"
  | "selectByLabel"
  | "snapshot"
  | "start"
  | "stop"
  | "typeByLabel"
>;

type ServerDependencies = {
  browserManager: BrowserManagerContract;
  config: AgentControlConfig;
  logger: DaemonLogger;
  seedPaymentCreate: SeedPaymentCreate;
};

export function createAgentControlServer(dependencies: ServerDependencies) {
  const { browserManager, config, logger, seedPaymentCreate } = dependencies;

  return createServer(async (request, response) => {
    try {
      const route = `${request.method ?? "GET"} ${
        new URL(
          request.url ?? "/",
          `http://${config.daemonHost}:${config.daemonPort}`,
        ).pathname
      }`;

      switch (route) {
        case "GET /health":
          return writeJson(response, 200, {
            ok: true,
            session: browserManager.hasSession() ? "active" : "none",
          });
        case "POST /session": {
          if (config.environment !== "development") {
            throw new AgentControlError(
              "INVALID_ARGUMENT",
              "Agent Controlはdevelopment環境でのみ利用できます。",
              403,
            );
          }
          await seedPaymentCreate();
          return writeJson(
            response,
            200,
            success(await browserManager.createAuthenticatedSession()),
          );
        }
        case "POST /goto": {
          const body = await readJson(request);
          const appPath = requireString(body, "path");
          return writeJson(
            response,
            200,
            success({ url: await browserManager.goto(appPath) }),
          );
        }
        case "GET /snapshot":
          return writeJson(
            response,
            200,
            success(await browserManager.snapshot()),
          );
        case "POST /type": {
          const body = await readJson(request);
          const label = requireString(body, "label");
          const value = requireString(body, "value", true);
          return writeJson(
            response,
            200,
            success({
              label,
              value: await browserManager.typeByLabel(label, value),
            }),
          );
        }
        case "POST /select": {
          const body = await readJson(request);
          const label = requireString(body, "label");
          const option = requireString(body, "option");
          return writeJson(
            response,
            200,
            success({
              label,
              option: await browserManager.selectByLabel(label, option),
            }),
          );
        }
        case "POST /click": {
          const body = await readJson(request);
          const role = requireString(body, "role");
          const name = requireString(body, "name");
          const waitForUrl = optionalString(body, "waitForUrl");
          return writeJson(
            response,
            200,
            success({
              name,
              role,
              url: await browserManager.clickByRole(
                role as Parameters<BrowserManager["clickByRole"]>[0],
                name,
                waitForUrl,
              ),
            }),
          );
        }
        case "POST /screenshot":
          return writeJson(
            response,
            200,
            success(await browserManager.screenshot()),
          );
        default:
          throw new AgentControlError(
            "INVALID_ARGUMENT",
            "指定されたAgent Control endpointは存在しません。",
            404,
          );
      }
    } catch (error) {
      const normalized = asAgentControlError(error);
      if (normalized.code !== "SEED_FAILED") {
        await logger.error("request-failed", serializeError(error));
      }
      return writeJson(
        response,
        normalized.status,
        failure(normalized.code, normalized.message),
      );
    }
  });
}

export type RunningDaemon = {
  stop: () => Promise<void>;
};

export async function startDaemon(options?: {
  handleSignals?: boolean;
}): Promise<RunningDaemon> {
  const config = loadAgentControlConfig();
  const logger = createDaemonLogger(config.daemonLogPath);
  const browserManager = new BrowserManager(config);
  const server = createAgentControlServer({
    browserManager,
    config,
    logger,
    seedPaymentCreate: createSeedPaymentCreate(config.repoRoot, logger),
  });

  try {
    await browserManager.start();
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(config.daemonPort, config.daemonHost, resolve);
    });
    await logger.info("daemon-started", {
      host: config.daemonHost,
      port: config.daemonPort,
    });
    process.stdout.write(
      `${JSON.stringify({
        ok: true,
        host: config.daemonHost,
        port: config.daemonPort,
      })}\n`,
    );
  } catch (error) {
    await logger.error("daemon-start-failed", serializeError(error));
    await browserManager.stop();
    throw error;
  }

  let isStopping = false;
  const stop = async () => {
    if (isStopping) return;
    isStopping = true;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await browserManager.stop();
    await logger.info("daemon-stopped");
  };

  if (options?.handleSignals !== false) {
    process.once("SIGINT", () => void stop());
    process.once("SIGTERM", () => void stop());
  }

  return { stop };
}

function writeJson(
  response: ServerResponse,
  status: number,
  body: unknown,
): void {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function readJson(
  request: IncomingMessage,
): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1_000_000) {
      throw new AgentControlError(
        "INVALID_ARGUMENT",
        "request bodyが大きすぎます。",
        413,
      );
    }
  }

  try {
    const value: unknown = raw ? JSON.parse(raw) : {};
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("body is not an object");
    }
    return value as Record<string, unknown>;
  } catch (error) {
    throw new AgentControlError(
      "INVALID_ARGUMENT",
      "request bodyにはJSON objectを指定してください。",
      400,
      { cause: error },
    );
  }
}

function requireString(
  body: Record<string, unknown>,
  key: string,
  allowEmpty = false,
): string {
  const value = body[key];
  if (typeof value !== "string" || (!allowEmpty && value.trim() === "")) {
    throw new AgentControlError(
      "INVALID_ARGUMENT",
      `${key}には文字列を指定してください。`,
      400,
    );
  }
  return value;
}

function optionalString(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = body[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    throw new AgentControlError(
      "INVALID_ARGUMENT",
      `${key}には文字列を指定してください。`,
      400,
    );
  }
  return value;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { error: String(error) };
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause:
      error.cause instanceof Error
        ? {
            name: error.cause.name,
            message: error.cause.message,
            stack: error.cause.stack,
          }
        : error.cause,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  startDaemon().catch((error: unknown) => {
    process.stderr.write(
      `${JSON.stringify({
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Agent Control daemonを起動できませんでした。",
        },
      })}\n`,
    );
    process.exitCode = 1;
  });
}

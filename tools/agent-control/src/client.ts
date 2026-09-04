import type { AgentControlResponse } from "./response.js";
import { failure } from "./response.js";

const daemonOrigin = "http://127.0.0.1:4317";

export async function requestDaemon<T extends object>(
  pathname: string,
  options: { body?: Record<string, unknown>; method?: "GET" | "POST" } = {},
): Promise<AgentControlResponse<T>> {
  try {
    const response = await fetch(`${daemonOrigin}${pathname}`, {
      method: options.method ?? "GET",
      headers: options.body
        ? { "content-type": "application/json" }
        : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return (await response.json()) as AgentControlResponse<T>;
  } catch {
    return failure(
      "DAEMON_NOT_RUNNING",
      "Agent Control daemonへ接続できません。先にpnpm okaeshi-control:daemonを実行してください。",
    );
  }
}

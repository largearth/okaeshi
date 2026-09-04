import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  chromium,
  errors,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";

import type { AgentControlConfig } from "./config.js";
import { AgentControlError } from "./errors.js";

export type SnapshotElement = {
  name: string;
  role: string;
  value?: string;
};

type AriaRole = Parameters<Page["getByRole"]>[0];

export class BrowserManager {
  private browser: Browser | undefined;
  private context: BrowserContext | undefined;
  private page: Page | undefined;
  private sessionId: string | undefined;

  constructor(private readonly config: AgentControlConfig) {}

  async start(): Promise<void> {
    this.browser ??= await chromium.launch({ headless: true });
  }

  async createAuthenticatedSession(): Promise<{
    session: string;
    url: string;
  }> {
    await this.start();
    await this.closeContext();

    this.context = await this.browser!.newContext({
      viewport: { width: 393, height: 852 },
    });
    this.page = await this.context.newPage();
    this.sessionId = randomUUID();

    try {
      const response = await this.context.request.post(
        `${this.config.apiOrigin}/api/auth/sign-in/email`,
        {
          data: {
            callbackURL: `${this.config.webOrigin}/home`,
            email: this.config.verificationUserEmail,
            password: this.config.verificationPassword,
          },
        },
      );

      if (!response.ok()) {
        throw new AgentControlError(
          "AUTH_FAILED",
          "検証用セッションを認証できませんでした。",
          500,
          {
            cause: new Error(
              `Better Auth returned ${response.status()}: ${await response.text()}`,
            ),
          },
        );
      }

      await this.page.goto(`${this.config.webOrigin}/home`, {
        waitUntil: "domcontentloaded",
      });
      return { session: this.sessionId, url: this.currentPath(this.page) };
    } catch (error) {
      await this.closeContext();
      if (error instanceof AgentControlError) throw error;
      throw new AgentControlError(
        "AUTH_FAILED",
        "検証用セッションを認証できませんでした。",
        500,
        { cause: error },
      );
    }
  }

  async goto(appPath: string): Promise<string> {
    const page = this.getPage();
    const url = this.resolveAppPath(appPath);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return this.currentPath(page);
    } catch (error) {
      throw new AgentControlError(
        "NAVIGATION_FAILED",
        `${appPath} へ移動できませんでした。`,
        500,
        { cause: error },
      );
    }
  }

  async snapshot(): Promise<{ elements: SnapshotElement[]; url: string }> {
    const page = this.getPage();
    const elements = await page
      .locator("h1,h2,h3,h4,h5,h6,button,a,input,textarea,select,[role]")
      .evaluateAll(collectSnapshotElements);

    return { elements, url: this.currentPath(page) };
  }

  async typeByLabel(label: string, value: string): Promise<string> {
    const page = this.getPage();
    const locator = page.getByLabel(label);

    try {
      await locator.fill(value, { timeout: 10_000 });
      return await locator.inputValue();
    } catch (error) {
      throw this.interactionError(error, `label が「${label}」の入力欄`);
    }
  }

  async selectByLabel(label: string, option: string): Promise<string> {
    const page = this.getPage();
    const locator = page.getByLabel(label);

    try {
      await locator.waitFor({ state: "visible", timeout: 10_000 });
      const tagName = await locator.evaluate((element) =>
        element.tagName.toLowerCase(),
      );
      if (tagName !== "select") {
        throw new AgentControlError(
          "INTERACTION_FAILED",
          "Phase 1のselectはnative <select>だけを操作できます。",
          422,
        );
      }
      const selected = await locator.selectOption({ label: option });
      if (selected.length === 0) {
        throw new AgentControlError(
          "ELEMENT_NOT_FOUND",
          `option「${option}」が見つかりませんでした。`,
          404,
        );
      }
      return await locator.locator("option:checked").innerText();
    } catch (error) {
      if (error instanceof AgentControlError) throw error;
      throw this.interactionError(error, `label が「${label}」のselect`);
    }
  }

  async clickByRole(
    role: AriaRole,
    name: string,
    waitForUrl?: string,
  ): Promise<string> {
    const page = this.getPage();

    try {
      await page.getByRole(role, { name, exact: true }).click({
        timeout: 10_000,
      });
    } catch (error) {
      throw this.interactionError(error, `${role}「${name}」`);
    }

    if (waitForUrl) {
      const expectedUrl = this.resolveAppPath(waitForUrl);
      try {
        await page.waitForURL(expectedUrl, { timeout: 10_000 });
      } catch (error) {
        throw new AgentControlError(
          "NAVIGATION_FAILED",
          `${waitForUrl} への遷移を確認できませんでした。`,
          500,
          { cause: error },
        );
      }
    }

    return this.currentPath(page);
  }

  async screenshot(): Promise<{ path: string; url: string }> {
    const page = this.getPage();
    const session = this.sessionId!;
    const timestamp = new Date()
      .toISOString()
      .replaceAll(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
    const screenshotDirectory = path.join(
      this.config.artifactRoot,
      "screenshots",
    );
    const filePath = path.join(
      screenshotDirectory,
      `${timestamp}-${session.slice(0, 8)}-${this.pathSlug(page)}.png`,
    );

    try {
      await mkdir(screenshotDirectory, { recursive: true });
      await page.screenshot({ fullPage: true, path: filePath });
      return {
        path: path.relative(this.config.repoRoot, filePath),
        url: this.currentPath(page),
      };
    } catch (error) {
      throw new AgentControlError(
        "SCREENSHOT_FAILED",
        "スクリーンショットを保存できませんでした。",
        500,
        { cause: error },
      );
    }
  }

  hasSession(): boolean {
    return Boolean(this.context && this.page && this.sessionId);
  }

  async stop(): Promise<void> {
    await this.closeContext();
    await this.browser?.close();
    this.browser = undefined;
  }

  private getPage(): Page {
    if (!this.page || !this.sessionId) {
      throw new AgentControlError(
        "SESSION_NOT_FOUND",
        "先にnew-sessionを実行してください。",
        409,
      );
    }
    return this.page;
  }

  private resolveAppPath(appPath: string): string {
    if (!appPath.startsWith("/") || appPath.startsWith("//")) {
      throw new AgentControlError(
        "INVALID_ARGUMENT",
        "pathには / で始まるOkaeshi内のpathを指定してください。",
        400,
      );
    }
    const url = new URL(appPath, this.config.webOrigin);
    if (url.origin !== this.config.webOrigin) {
      throw new AgentControlError(
        "INVALID_ARGUMENT",
        "Okaeshiと異なるoriginには移動できません。",
        400,
      );
    }
    return url.href;
  }

  private interactionError(error: unknown, target: string): AgentControlError {
    if (error instanceof errors.TimeoutError) {
      return new AgentControlError(
        "ELEMENT_NOT_FOUND",
        `${target}が見つかりませんでした。`,
        404,
        { cause: error },
      );
    }
    return new AgentControlError(
      "INTERACTION_FAILED",
      `${target}を操作できませんでした。`,
      422,
      { cause: error },
    );
  }

  private currentPath(page: Page): string {
    const url = new URL(page.url());
    return `${url.pathname}${url.search}${url.hash}`;
  }

  private pathSlug(page: Page): string {
    const slug = new URL(page.url()).pathname
      .replace(/^\/+|\/+$/g, "")
      .replaceAll(/[^a-zA-Z0-9-]+/g, "-");
    return slug || "root";
  }

  private async closeContext(): Promise<void> {
    await this.context?.close();
    this.context = undefined;
    this.page = undefined;
    this.sessionId = undefined;
  }
}

function collectSnapshotElements(nodes: Element[]): SnapshotElement[] {
  const result: SnapshotElement[] = [];

  for (const element of nodes) {
    const style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      element.getClientRects().length === 0
    ) {
      continue;
    }

    const tagName = element.tagName.toLowerCase();
    let role = element.getAttribute("role") ?? "";
    if (!role) {
      if (/^h[1-6]$/.test(tagName)) role = "heading";
      else if (tagName === "button") role = "button";
      else if (tagName === "a" && element.hasAttribute("href")) role = "link";
      else if (tagName === "textarea") role = "textbox";
      else if (tagName === "select") {
        const select = element as HTMLSelectElement;
        role = select.multiple || select.size > 1 ? "listbox" : "combobox";
      } else if (tagName === "input") {
        const type = (element as HTMLInputElement).type;
        if (type === "button" || type === "submit" || type === "reset") {
          role = "button";
        } else if (type === "checkbox") role = "checkbox";
        else if (type === "radio") role = "radio";
        else if (type === "range") role = "slider";
        else role = "textbox";
      }
    }
    if (!role) continue;

    let name = (element.getAttribute("aria-label") ?? "")
      .replace(/\s+/g, " ")
      .trim();
    const labelledBy = element.getAttribute("aria-labelledby");
    if (!name && labelledBy) {
      const names: string[] = [];
      for (const id of labelledBy.split(/\s+/)) {
        const text = (document.getElementById(id)?.textContent ?? "")
          .replace(/\s+/g, " ")
          .trim();
        if (text) names.push(text);
      }
      name = names.join(" ");
    }

    if (
      !name &&
      (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement)
    ) {
      const names: string[] = [];
      for (const label of Array.from(element.labels ?? [])) {
        const clone = label.cloneNode(true) as HTMLLabelElement;
        for (const control of clone.querySelectorAll(
          "input,textarea,select,button",
        )) {
          control.remove();
        }
        const text = (clone.textContent ?? "").replace(/\s+/g, " ").trim();
        if (text) names.push(text);
      }
      name = names.join(" ");
    }

    if (!name) {
      name = (
        element.textContent ||
        element.getAttribute("title") ||
        element.getAttribute("placeholder") ||
        ""
      )
        .replace(/\s+/g, " ")
        .trim();
    }
    if (!name) continue;

    const item: SnapshotElement = { name, role };
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      item.value = element.value;
    } else if (element instanceof HTMLSelectElement) {
      const selected: string[] = [];
      for (const option of Array.from(element.selectedOptions)) {
        selected.push((option.textContent ?? "").replace(/\s+/g, " ").trim());
      }
      item.value = selected.join(", ");
    }
    result.push(item);
  }

  return result;
}

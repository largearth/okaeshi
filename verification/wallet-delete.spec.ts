import { expect, test } from "@playwright/test";

test("未参照の財布を削除し、参照中の財布は削除できない", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("ログイン ID（メールアドレス）")
    .fill(process.env.VERIFY_USER_EMAIL ?? "");
  await page
    .getByLabel("パスワード")
    .fill(process.env.VERIFY_USER_PASSWORD ?? "");
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("**/home");

  await page.goto("/wallets");
  await expect(page.getByRole("heading", { name: "財布管理" })).toBeVisible();
  await expect(page.getByText("E2E 削除可能財布")).toBeVisible();
  await expect(page.getByText("E2E 参照中財布")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "E2E 削除可能財布を削除" }).click();
  await expect(page.getByText("E2E 削除可能財布")).toHaveCount(0);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "E2E 参照中財布を削除" }).click();
  await expect(
    page.getByRole("alert").filter({
      hasText: "参照されている財布は削除できません。",
    }),
  ).toBeVisible();
  await expect(page.getByText("E2E 参照中財布")).toBeVisible();
  await page.screenshot({
    path: "verification-artifacts/wallet-delete-after.png",
    fullPage: true,
  });
});

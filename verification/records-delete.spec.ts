import { expect, test } from "@playwright/test";

test("未配分出金を削除し、配分済み出金は削除できない", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("ログイン ID（メールアドレス）")
    .fill(process.env.VERIFY_USER_EMAIL ?? "");
  await page
    .getByLabel("パスワード")
    .fill(process.env.VERIFY_USER_PASSWORD ?? "");
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("**/home");

  await page.getByRole("link", { name: "レコード" }).click();
  await expect(page.getByRole("heading", { name: "出金記録" })).toBeVisible();
  await expect(page.getByText("E2E 未配分出金")).toBeVisible();
  await expect(page.getByText("E2E 配分済出金")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "E2E 配分済出金を削除" }),
  ).toHaveCount(0);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "E2E 未配分出金を削除" }).click();
  await expect(page.getByText("E2E 未配分出金")).toHaveCount(0);
  await expect(page.getByText("E2E 配分済出金")).toBeVisible();
  await page.screenshot({
    path: "verification-artifacts/records-delete-after.png",
    fullPage: true,
  });
});

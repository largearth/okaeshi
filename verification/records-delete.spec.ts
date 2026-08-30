import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 393, height: 852 } });

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
  await expect(page.getByRole("heading", { name: "Record" })).toBeVisible();
  await expect(page.getByText("E2E 未配分出金")).toBeVisible();
  await expect(page.getByText("E2E 配分済出金")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "E2E 配分済出金を削除" }),
  ).toHaveCount(0);

  await page.getByText("E2E 未配分出金").click();
  await expect(page.getByRole("heading", { name: "¥1,000" })).toBeVisible();
  await page.screenshot({
    path: "verification-artifacts/records-detail.png",
    fullPage: true,
  });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "操作メニューを開く" }).click();
  await page.screenshot({
    path: "verification-artifacts/records-detail-menu.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /削除する/ }).click();
  await page.waitForURL("**/records");
  await expect(page.getByText("E2E 未配分出金")).toHaveCount(0);
  await expect(page.getByText("E2E 配分済出金")).toBeVisible();
  await page.screenshot({
    path: "verification-artifacts/records-delete-after.png",
    fullPage: true,
  });
});

import { expect, test } from "@playwright/test";

const webOrigin = process.env.VERIFY_WEB_ORIGIN ?? "http://localhost:5173";
const apiOrigin = process.env.VERIFY_API_ORIGIN ?? "http://localhost:8787";

test.use({ viewport: { width: 393, height: 852 } });

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

test("認証済みの状態から出金を作成できる", async ({ page }) => {
  const signInResponse = await page.request.post(
    `${apiOrigin}/api/auth/sign-in/email`,
    {
      data: {
        email: process.env.VERIFY_USER_EMAIL ?? "verification@example.test",
        password: "verify-payment-create-password",
        callbackURL: `${webOrigin}/home`,
      },
    },
  );
  expect(signInResponse.status(), await signInResponse.text()).toBe(200);

  await page.goto(`${webOrigin}/payments/new`);

  const amountInput = page.getByLabel("金額");
  await expect(amountInput).toBeFocused();
  await expect(page.getByLabel("日付（任意）")).toHaveValue(today());

  await amountInput.fill("500");
  await page.getByLabel("出金元の財布").selectOption({
    label: "E2E 出金作成用財布",
  });
  await page.getByLabel("用途").fill("E2E 出金作成");
  await page.screenshot({
    path: "verification-artifacts/payment-create-form.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "出金を記録する" }).click();

  await page.waitForURL("**/records");
  await expect(page.getByRole("heading", { name: "出金記録" })).toBeVisible();
  await expect(page.getByText("E2E 出金作成", { exact: true })).toBeVisible();
  await expect(page.getByText("¥500", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "verification-artifacts/payment-create-after.png",
    fullPage: true,
  });
});

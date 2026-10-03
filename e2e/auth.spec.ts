import { expect, test } from "@playwright/test";

// ログインテストはキャッシュ済み認証を使わない
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("認証", () => {
  test("未ログイン時はログイン画面にリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("正しい認証情報でログインできる", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#username", "admin");
    await page.fill("#password", "dev-password-123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("http://localhost:8080/");
    await expect(page.locator(".kanban-columns")).toBeVisible();
  });

  test("誤ったパスワードではログインできない", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#username", "admin");
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator(".text-error")).toBeVisible();
  });

  test("ログアウトするとログイン画面に戻る", async ({ page }) => {
    // global-setup のセッションは test.use で無効化しているため手動ログイン
    await page.goto("/login");
    await page.fill("#username", "admin");
    await page.fill("#password", "dev-password-123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("http://localhost:8080/");

    await page.getByRole("button", { name: "ログアウト" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

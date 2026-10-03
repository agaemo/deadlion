import { chromium } from "@playwright/test";

/** ログインして storage state をキャッシュする（テストごとのログインをスキップ） */
export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:8080/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "dev-password-123");
  await page.click('button[type="submit"]');

  // パスワード変更要求画面が出た場合はスキップ（dev環境では changeme→変更済みの場合のみ）
  if (page.url().includes("change-password")) {
    // すでに変更済みのはずなのでここには来ないが念のため
    throw new Error("パスワード変更が要求されました。.env.local の AUTH_PASSWORD_HASH を確認してください。");
  }

  await page.waitForURL("http://localhost:8080/", { timeout: 10000 });
  await page.context().storageState({ path: "e2e/.auth.json" });
  await browser.close();
}

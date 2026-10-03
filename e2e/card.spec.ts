import { expect, test } from "@playwright/test";

function modal(page: import("@playwright/test").Page) {
  return page.locator(".fixed.inset-0.z-50");
}

test.describe("カード CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".kanban-columns");
  });

  test("カードを作成できる", async ({ page }) => {
    const title = `CRUD作成-${Date.now()}`;
    await page.getByRole("button", { name: "+ カード追加" }).first().click();
    await page.locator("#card-title").fill(title);
    await modal(page).getByRole("button", { name: "保存" }).click();
    await page.waitForTimeout(600);

    await expect(page.getByText(title)).toBeVisible();

    // クリーンアップ
    await page.getByText(title).click();
    await page.locator("h2", { hasText: "カードを編集" }).waitFor();
    await modal(page).getByRole("button", { name: "削除", exact: true }).click();
  });

  test("カードを編集できる", async ({ page }) => {
    const original = `CRUD編集前-${Date.now()}`;
    const updated = `CRUD編集後-${Date.now()}`;

    // 作成
    await page.getByRole("button", { name: "+ カード追加" }).first().click();
    await page.locator("#card-title").fill(original);
    await modal(page).getByRole("button", { name: "保存" }).click();
    await page.waitForTimeout(600);

    // 編集
    await page.getByText(original).click();
    await page.locator("h2", { hasText: "カードを編集" }).waitFor();
    await page.locator("#card-title").fill(updated);
    await modal(page).getByRole("button", { name: "保存" }).click();
    await page.waitForTimeout(600);

    await expect(page.getByText(updated)).toBeVisible();
    await expect(page.getByText(original)).not.toBeVisible();

    // クリーンアップ
    await page.getByText(updated).click();
    await page.locator("h2", { hasText: "カードを編集" }).waitFor();
    await modal(page).getByRole("button", { name: "削除", exact: true }).click();
  });
});

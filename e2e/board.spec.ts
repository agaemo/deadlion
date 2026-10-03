import { expect, test } from "@playwright/test";
import { getScrollLeft, scrollBoardTo } from "./helpers";

/** モーダルオーバーレイ内のロケータ */
function modal(page: import("@playwright/test").Page) {
  return page.locator(".fixed.inset-0.z-50");
}

test.describe("カンバンボード", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".kanban-columns");
  });

  test("Bug1: カード削除後もスクロール位置が保持される", async ({ page }) => {
    // 右にスクロール（列が4つ以上あれば overflow する）
    await scrollBoardTo(page, 400);
    const scrollBefore = await getScrollLeft(page);
    expect(scrollBefore).toBeGreaterThan(0);

    // 最右端の列にカードを作成
    const title = `E2E-スクロール-${Date.now()}`;
    await page.getByRole("button", { name: "+ カード追加" }).last().click();
    await page.locator("#card-title").fill(title);
    await modal(page).getByRole("button", { name: "保存" }).click();
    await page.waitForTimeout(700);

    // 作成後もスクロール位置が保持されること
    const scrollAfterCreate = await getScrollLeft(page);
    expect(scrollAfterCreate).toBeGreaterThan(0);

    // 作成したカードを開いて削除
    await page.getByText(title).click();
    await page.locator("h2", { hasText: "カードを編集" }).waitFor();
    await modal(page).getByRole("button", { name: "削除", exact: true }).click();
    await page.waitForTimeout(700);

    // 削除後もスクロール位置が保持されること
    const scrollAfterDelete = await getScrollLeft(page);
    expect(scrollAfterDelete).toBeGreaterThan(0);
  });

  test("Bug2: カード色を「設定なし」にすると色がクリアされる", async ({ page }) => {
    const title = `E2E-色-${Date.now()}`;

    // カードを作成し赤色を設定
    await page.getByRole("button", { name: "+ カード追加" }).first().click();
    await page.locator("#card-title").fill(title);
    await modal(page).getByRole("button", { name: /色を#C0392Bにする/ }).click();
    await modal(page).getByRole("button", { name: "保存" }).click();
    await page.waitForTimeout(700);

    // 開いて「設定なし」に変更して保存
    await page.getByText(title).click();
    await page.locator("h2", { hasText: "カードを編集" }).waitFor();
    await modal(page).getByRole("button", { name: /色を未設定にする/ }).click();
    await modal(page).getByRole("button", { name: "保存" }).click();
    await page.waitForTimeout(700);

    // 再度開いて「設定なし」ボタンが選択状態（aria-pressed="true"）であること
    await page.getByText(title).click();
    await page.locator("h2", { hasText: "カードを編集" }).waitFor();
    await expect(
      modal(page).getByRole("button", { name: /色を未設定にする/ })
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      modal(page).getByRole("button", { name: /色を#C0392Bにする/ })
    ).toHaveAttribute("aria-pressed", "false");

    // クリーンアップ
    await modal(page).getByRole("button", { name: "削除", exact: true }).click();
    await page.waitForTimeout(500);
  });
});

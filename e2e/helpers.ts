import { type Page } from "@playwright/test";

/** カンバン列のスクロール位置を返す */
export async function getScrollLeft(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.querySelector(".kanban-columns") as HTMLElement | null;
    return el?.scrollLeft ?? 0;
  });
}

/** カンバン列を指定ピクセルにスクロールする */
export async function scrollBoardTo(page: Page, px: number) {
  await page.evaluate((amount) => {
    const el = document.querySelector(".kanban-columns") as HTMLElement | null;
    if (el) el.scrollLeft = amount;
  }, px);
  await page.waitForTimeout(150);
}

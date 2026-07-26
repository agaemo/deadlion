import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { createCardRepository } from "../db/repositories/drizzle/card-repository";
import { createColumnRepository } from "../db/repositories/drizzle/column-repository";
import { createLabelRepository } from "../db/repositories/drizzle/label-repository";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { createBoardService } from "./board-service";

describe("createBoardService", () => {
  const tmpPaths: string[] = [];

  afterEach(() => {
    for (const path of tmpPaths.splice(0)) {
      cleanupTmpDbFile(path);
    }
  });

  function setupDb() {
    const path = createTmpDbPath();
    tmpPaths.push(path);
    const db = createDb(path);
    runMigrations(db);
    return db;
  }

  function setupService(db: ReturnType<typeof createDb>) {
    const columnRepo = createColumnRepository(db);
    const cardRepo = createCardRepository(db);
    const labelRepo = createLabelRepository(db);
    const service = createBoardService({ columnRepo, cardRepo, labelRepo });
    return { service, columnRepo, cardRepo, labelRepo };
  }

  it("列が0件のとき、5列（未整理・未着手・進行中・完了・対応なし）が自動生成されて返る", () => {
    const db = setupDb();
    const { service } = setupService(db);

    const board = service.getBoard();

    expect(board).toHaveLength(5);
    expect(board.map((c) => c.name)).toEqual([
      "未整理",
      "未着手",
      "進行中",
      "完了",
      "対応なし",
    ]);
  });

  it("列が0件のとき、getBoardを複数回呼んでも列は5件のまま増えない", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);

    service.getBoard();
    service.getBoard();

    expect(columnRepo.count()).toBe(5);
  });

  it("既に列が存在する場合は自動生成しない", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    columnRepo.create("カスタム列", 0);

    const board = service.getBoard();

    expect(board).toHaveLength(1);
    expect(board[0]?.name).toBe("カスタム列");
  });

  it("各カードにラベル情報が含まれる", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo, labelRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    const card = cardRepo.create({ columnId: column.id, title: "タスク1" });
    labelRepo.setLabelsForCard(card.id, ["緊急", "バグ"]);

    const board = service.getBoard();

    const targetColumn = board.find((c) => c.id === column.id);
    const targetCard = targetColumn?.cards.find((c) => c.id === card.id);
    expect(targetCard?.labels.map((l) => l.name).sort()).toEqual([
      "バグ",
      "緊急",
    ]);
  });

  it("カードが無い列は空のcards配列を持つ", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    columnRepo.create("空の列", 0);

    const board = service.getBoard();

    expect(board[0]?.cards).toEqual([]);
  });
});

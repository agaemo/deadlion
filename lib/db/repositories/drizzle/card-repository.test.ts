import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../../index";
import { runMigrations } from "../../migrate";
import { columns } from "../../schema";
import { cleanupTmpDbFile, createTmpDbPath } from "../../test-utils";
import { createCardRepository } from "./card-repository";

describe("createCardRepository", () => {
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

  function insertColumn(db: ReturnType<typeof createDb>, name: string, position: number): number {
    const row = db
      .insert(columns)
      .values({ name, position, createdAt: new Date().toISOString() })
      .returning({ id: columns.id })
      .get();
    return row.id;
  }

  it("create: 作成したカードがfindByIdで取得できる", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnId = insertColumn(db, "未着手", 0);

    const created = repo.create({ columnId, title: "タスク1" });
    const found = repo.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.title).toBe("タスク1");
    expect(found?.columnId).toBe(columnId);
  });

  it("create: 任意項目を指定しなくても作成できる", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnId = insertColumn(db, "未着手", 0);

    const created = repo.create({ columnId, title: "タイトルのみ" });

    expect(created.description).toBeFalsy();
    expect(created.deadline).toBeFalsy();
  });

  it("create: 同じ列に複数作成すると後のカードのpositionが前より大きくなる", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnId = insertColumn(db, "未着手", 0);

    const card1 = repo.create({ columnId, title: "タスク1" });
    const card2 = repo.create({ columnId, title: "タスク2" });

    expect(card2.position).toBeGreaterThan(card1.position);
  });

  it("findByColumnId: 対象列のカードのみ返る", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnA = insertColumn(db, "A列", 0);
    const columnB = insertColumn(db, "B列", 1);
    const cardA = repo.create({ columnId: columnA, title: "A列のタスク" });
    repo.create({ columnId: columnB, title: "B列のタスク" });

    const result = repo.findByColumnId(columnA);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(cardA.id);
  });

  it("update: 変更した内容が反映される", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnId = insertColumn(db, "未着手", 0);
    const card = repo.create({ columnId, title: "元のタイトル" });

    const updated = repo.update(card.id, {
      title: "更新後のタイトル",
      description: "詳細説明",
      color: "#ff0000",
    });

    expect(updated?.title).toBe("更新後のタイトル");
    expect(updated?.description).toBe("詳細説明");
    expect(updated?.color).toBe("#ff0000");
  });

  it("update: 存在しないIDの場合はundefinedを返す", () => {
    const db = setupDb();
    const repo = createCardRepository(db);

    const result = repo.update(999999, { title: "存在しない" });

    expect(result).toBeUndefined();
  });

  it("delete: 削除後はfindByIdがundefinedになる", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnId = insertColumn(db, "未着手", 0);
    const card = repo.create({ columnId, title: "削除対象" });

    repo.delete(card.id);

    expect(repo.findById(card.id)).toBeUndefined();
  });

  it("updateColumnAndPosition: columnIdとpositionが更新される", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnA = insertColumn(db, "A列", 0);
    const columnB = insertColumn(db, "B列", 1);
    const card = repo.create({ columnId: columnA, title: "移動対象" });

    repo.updateColumnAndPosition(card.id, columnB, 5);

    const found = repo.findById(card.id);
    expect(found?.columnId).toBe(columnB);
    expect(found?.position).toBe(5);
  });

  it("moveAllToColumn: 対象列の全カードのcolumn_idが移動先に変わる", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const fromColumn = insertColumn(db, "削除される列", 0);
    const toColumn = insertColumn(db, "未整理", 1);
    const card1 = repo.create({ columnId: fromColumn, title: "タスク1" });
    const card2 = repo.create({ columnId: fromColumn, title: "タスク2" });

    repo.moveAllToColumn(fromColumn, toColumn);

    expect(repo.findById(card1.id)?.columnId).toBe(toColumn);
    expect(repo.findById(card2.id)?.columnId).toBe(toColumn);
    expect(repo.findByColumnId(fromColumn)).toHaveLength(0);
  });

  it("moveAllToColumn: 対象外の列のカードには影響しない", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const fromColumn = insertColumn(db, "削除される列", 0);
    const toColumn = insertColumn(db, "未整理", 1);
    const otherColumn = insertColumn(db, "他の列", 2);
    const otherCard = repo.create({ columnId: otherColumn, title: "無関係タスク" });

    repo.moveAllToColumn(fromColumn, toColumn);

    expect(repo.findById(otherCard.id)?.columnId).toBe(otherColumn);
  });

  it("maxPositionInColumn: カードが無い列では新規カードのposition計算に使える初期値(0以下)を返す", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnId = insertColumn(db, "空の列", 0);

    const max = repo.maxPositionInColumn(columnId);

    expect(max).toBeLessThanOrEqual(0);
  });

  it("maxPositionInColumn: カードがある列では最大のpositionを返す", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnId = insertColumn(db, "未着手", 0);
    const card1 = repo.create({ columnId, title: "タスク1" });
    const card2 = repo.create({ columnId, title: "タスク2" });

    const max = repo.maxPositionInColumn(columnId);

    expect(max).toBe(Math.max(card1.position, card2.position));
  });

  it("findAll: 全カードを返す", () => {
    const db = setupDb();
    const repo = createCardRepository(db);
    const columnA = insertColumn(db, "A列", 0);
    const columnB = insertColumn(db, "B列", 1);
    repo.create({ columnId: columnA, title: "タスク1" });
    repo.create({ columnId: columnB, title: "タスク2" });

    expect(repo.findAll()).toHaveLength(2);
  });
});

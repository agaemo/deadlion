import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { createCardRepository } from "../db/repositories/drizzle/card-repository";
import { createColumnRepository } from "../db/repositories/drizzle/column-repository";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { createColumnService } from "./column-service";

describe("createColumnService", () => {
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
    const service = createColumnService({ columnRepo, cardRepo });
    return { service, columnRepo, cardRepo };
  }

  it("createColumn: 既存列の末尾（position=現在の列数）に追加される", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    columnRepo.create("列A", 0);
    columnRepo.create("列B", 1);

    const created = service.createColumn("列C");

    expect(created.position).toBe(2);
    expect(columnRepo.findAll()).toHaveLength(3);
  });

  it("createColumn: 列が1件も無い状態でもposition=0で作成される", () => {
    const db = setupDb();
    const { service } = setupService(db);

    const created = service.createColumn("最初の列");

    expect(created.position).toBe(0);
  });

  it("deleteColumn: 対象列のカードが「未整理」列へ移動してから列が削除される", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const misc = columnRepo.create("未整理", 0);
    const target = columnRepo.create("対象列", 1);
    const card = cardRepo.create({ columnId: target.id, title: "タスク1" });

    service.deleteColumn(target.id);

    expect(cardRepo.findById(card.id)?.columnId).toBe(misc.id);
    expect(columnRepo.findAll().some((c) => c.id === target.id)).toBe(false);
  });

  it("deleteColumn: 「未整理」列自体は削除できない（操作は無視され列・カードとも変化しない）", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const misc = columnRepo.create("未整理", 0);
    const card = cardRepo.create({ columnId: misc.id, title: "タスク1" });

    service.deleteColumn(misc.id);

    expect(columnRepo.findAll().some((c) => c.id === misc.id)).toBe(true);
    expect(cardRepo.findById(card.id)?.columnId).toBe(misc.id);
  });

  it("renameColumn: 列名が更新される", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    const col = columnRepo.create("旧名前", 0);

    const renamed = service.renameColumn(col.id, "新名前");

    expect(renamed.name).toBe("新名前");
    expect(columnRepo.findAll()[0].name).toBe("新名前");
  });

  it("reorderColumns: 指定した順序でpositionが反映される", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    const colA = columnRepo.create("A", 0);
    const colB = columnRepo.create("B", 1);
    const colC = columnRepo.create("C", 2);

    service.reorderColumns([colC.id, colA.id, colB.id]);

    const all = columnRepo.findAll();
    expect(all.map((c) => c.id)).toEqual([colC.id, colA.id, colB.id]);
  });
});

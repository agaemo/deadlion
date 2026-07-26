import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { createCardRepository } from "../db/repositories/drizzle/card-repository";
import { createColumnRepository } from "../db/repositories/drizzle/column-repository";
import { createCommentRepository } from "../db/repositories/drizzle/comment-repository";
import { createLabelRepository } from "../db/repositories/drizzle/label-repository";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { createCardService } from "./card-service";

describe("createCardService", () => {
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
    const cardRepo = createCardRepository(db);
    const labelRepo = createLabelRepository(db);
    const commentRepo = createCommentRepository(db);
    const columnRepo = createColumnRepository(db);
    const service = createCardService({ cardRepo, labelRepo, commentRepo });
    return { service, cardRepo, labelRepo, commentRepo, columnRepo };
  }

  it("createCard: labelNamesを指定するとラベルが紐付く", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);

    const card = service.createCard({
      columnId: column.id,
      title: "タスク1",
      labelNames: ["緊急", "バグ"],
    });

    expect(card.labels.map((l) => l.name).sort()).toEqual(["バグ", "緊急"]);
  });

  it("createCard: labelNamesを指定しなければラベルは空配列", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);

    const card = service.createCard({ columnId: column.id, title: "タスク1" });

    expect(card.labels).toEqual([]);
  });

  it("updateCard: 存在しないIDの場合はundefinedを返す", () => {
    const db = setupDb();
    const { service } = setupService(db);

    const result = service.updateCard(999999, { title: "存在しない" });

    expect(result).toBeUndefined();
  });

  it("updateCard: labelNamesを指定するとラベルが更新される", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    const card = service.createCard({
      columnId: column.id,
      title: "タスク1",
      labelNames: ["緊急"],
    });

    const updated = service.updateCard(card.id, { labelNames: ["改善"] });

    expect(updated?.labels.map((l) => l.name)).toEqual(["改善"]);
  });

  it("getCard: ラベルとコメントを含めて返す", () => {
    const db = setupDb();
    const { service, columnRepo, commentRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    const card = service.createCard({
      columnId: column.id,
      title: "タスク1",
      labelNames: ["緊急"],
    });
    commentRepo.create(card.id, "コメント1");

    const found = service.getCard(card.id);

    expect(found?.labels.map((l) => l.name)).toEqual(["緊急"]);
    expect(found?.comments).toHaveLength(1);
    expect(found?.comments[0]?.body).toBe("コメント1");
  });

  it("getCard: 存在しないIDの場合はundefinedを返す", () => {
    const db = setupDb();
    const { service } = setupService(db);

    expect(service.getCard(999999)).toBeUndefined();
  });

  it("deleteCard: 削除後はgetCardがundefinedになる", () => {
    const db = setupDb();
    const { service, columnRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    const card = service.createCard({ columnId: column.id, title: "削除対象" });

    service.deleteCard(card.id);

    expect(service.getCard(card.id)).toBeUndefined();
  });

  it("moveCard: columnIdとpositionが変わる", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const columnA = columnRepo.create("A列", 0);
    const columnB = columnRepo.create("B列", 1);
    const card = service.createCard({ columnId: columnA.id, title: "移動対象" });

    service.moveCard(card.id, columnB.id, 3);

    const found = cardRepo.findById(card.id);
    expect(found?.columnId).toBe(columnB.id);
    expect(found?.position).toBe(3);
  });
});

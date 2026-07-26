import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { createCardRepository } from "../db/repositories/drizzle/card-repository";
import { createColumnRepository } from "../db/repositories/drizzle/column-repository";
import { createCommentRepository } from "../db/repositories/drizzle/comment-repository";
import { createLabelRepository } from "../db/repositories/drizzle/label-repository";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { createTaskService } from "./task-service";

describe("createTaskService", () => {
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
    const service = createTaskService({ cardRepo, labelRepo, commentRepo });
    return { service, cardRepo, labelRepo, commentRepo, columnRepo };
  }

  it("query未指定の場合は全カードを返す", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({ columnId: column.id, title: "タスクA" });
    cardRepo.create({ columnId: column.id, title: "タスクB" });

    const tasks = service.getTasks({});

    expect(tasks).toHaveLength(2);
  });

  it("query: 空文字の場合は全カードを返す", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({ columnId: column.id, title: "タスクA" });

    const tasks = service.getTasks({ query: "" });

    expect(tasks).toHaveLength(1);
  });

  it("query: タイトルに部分一致するカードのみ返る", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({ columnId: column.id, title: "会議の準備" });
    cardRepo.create({ columnId: column.id, title: "資料作成" });

    const tasks = service.getTasks({ query: "会議" });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe("会議の準備");
  });

  it("query: 大小文字を区別せずタイトルに一致する", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({ columnId: column.id, title: "Deploy Task" });

    const tasks = service.getTasks({ query: "deploy" });

    expect(tasks).toHaveLength(1);
  });

  it("query: ラベル名に部分一致するカードを返す", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo, labelRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    const card = cardRepo.create({ columnId: column.id, title: "タスクA" });
    cardRepo.create({ columnId: column.id, title: "タスクB" });
    labelRepo.setLabelsForCard(card.id, ["緊急対応"]);

    const tasks = service.getTasks({ query: "緊急" });

    expect(tasks.map((t) => t.id)).toEqual([card.id]);
  });

  it("query: 説明文に部分一致するカードを返す", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({
      columnId: column.id,
      title: "タスクA",
      description: "重要な検討事項が含まれる",
    });
    cardRepo.create({
      columnId: column.id,
      title: "タスクB",
      description: "特に無し",
    });

    const tasks = service.getTasks({ query: "検討事項" });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe("タスクA");
  });

  it("query: コメント本文に部分一致するカードを返す", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo, commentRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    const card = cardRepo.create({ columnId: column.id, title: "タスクA" });
    cardRepo.create({ columnId: column.id, title: "タスクB" });
    commentRepo.create(card.id, "レビューコメントです");

    const tasks = service.getTasks({ query: "レビュー" });

    expect(tasks.map((t) => t.id)).toEqual([card.id]);
  });

  it("sort=title, order=asc でタイトル昇順に並ぶ", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({ columnId: column.id, title: "Banana" });
    cardRepo.create({ columnId: column.id, title: "Apple" });

    const tasks = service.getTasks({ sort: "title", order: "asc" });

    expect(tasks.map((t) => t.title)).toEqual(["Apple", "Banana"]);
  });

  it("sort=title, order=desc でタイトル降順に並ぶ", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({ columnId: column.id, title: "Banana" });
    cardRepo.create({ columnId: column.id, title: "Apple" });

    const tasks = service.getTasks({ sort: "title", order: "desc" });

    expect(tasks.map((t) => t.title)).toEqual(["Banana", "Apple"]);
  });

  it("sort=deadline でdeadline昇順に並ぶ", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({
      columnId: column.id,
      title: "遅い",
      deadline: "2026-12-01",
    });
    cardRepo.create({
      columnId: column.id,
      title: "早い",
      deadline: "2026-01-01",
    });

    const tasks = service.getTasks({ sort: "deadline", order: "asc" });

    expect(tasks.map((t) => t.title)).toEqual(["早い", "遅い"]);
  });
});

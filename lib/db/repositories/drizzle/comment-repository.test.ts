import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../../index";
import { runMigrations } from "../../migrate";
import { cards, columns } from "../../schema";
import { cleanupTmpDbFile, createTmpDbPath } from "../../test-utils";
import { createCommentRepository } from "./comment-repository";

describe("createCommentRepository", () => {
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

  function insertCard(db: ReturnType<typeof createDb>, title: string): number {
    const columnRow = db
      .insert(columns)
      .values({ name: "未着手", position: 0, createdAt: new Date().toISOString() })
      .returning({ id: columns.id })
      .get();

    const cardRow = db
      .insert(cards)
      .values({
        columnId: columnRow.id,
        title,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: cards.id })
      .get();

    return cardRow.id;
  }

  it("create: 作成したコメントがfindByCardIdで取得できる", () => {
    const db = setupDb();
    const repo = createCommentRepository(db);
    const cardId = insertCard(db, "タスク1");

    const created = repo.create(cardId, "最初のコメント");

    const comments = repo.findByCardId(cardId);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.id).toBe(created.id);
    expect(comments[0]?.body).toBe("最初のコメント");
  });

  it("findByCardId: 対象カードのコメントのみ返る", () => {
    const db = setupDb();
    const repo = createCommentRepository(db);
    const cardA = insertCard(db, "タスクA");
    const cardB = insertCard(db, "タスクB");
    repo.create(cardA, "Aへのコメント");
    repo.create(cardB, "Bへのコメント");

    const result = repo.findByCardId(cardA);

    expect(result).toHaveLength(1);
    expect(result[0]?.body).toBe("Aへのコメント");
  });

  it("update: 本文が変わる", () => {
    const db = setupDb();
    const repo = createCommentRepository(db);
    const cardId = insertCard(db, "タスク1");
    const comment = repo.create(cardId, "元のコメント");

    const updated = repo.update(comment.id, "更新後のコメント");

    expect(updated?.body).toBe("更新後のコメント");
  });

  it("update: 存在しないIDの場合はundefinedを返す", () => {
    const db = setupDb();
    const repo = createCommentRepository(db);

    const result = repo.update(999999, "存在しない");

    expect(result).toBeUndefined();
  });

  it("delete: 削除後はfindByCardIdから消える", () => {
    const db = setupDb();
    const repo = createCommentRepository(db);
    const cardId = insertCard(db, "タスク1");
    const comment = repo.create(cardId, "削除対象のコメント");

    repo.delete(comment.id);

    expect(repo.findByCardId(cardId)).toHaveLength(0);
  });
});

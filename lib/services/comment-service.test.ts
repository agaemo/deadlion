import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { createCommentRepository } from "../db/repositories/drizzle/comment-repository";
import { cards, columns } from "../db/schema";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { createCommentService } from "./comment-service";

describe("createCommentService", () => {
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

  function insertCard(db: ReturnType<typeof createDb>): number {
    const columnRow = db
      .insert(columns)
      .values({
        name: "未着手",
        position: 0,
        createdAt: new Date().toISOString(),
      })
      .returning({ id: columns.id })
      .get();

    const cardRow = db
      .insert(cards)
      .values({
        columnId: columnRow.id,
        title: "タスク1",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: cards.id })
      .get();

    return cardRow.id;
  }

  function setupService(db: ReturnType<typeof createDb>) {
    const commentRepo = createCommentRepository(db);
    const service = createCommentService({ commentRepo });
    return { service, commentRepo };
  }

  it("addComment: コメントを追加できる", () => {
    const db = setupDb();
    const { service, commentRepo } = setupService(db);
    const cardId = insertCard(db);

    const comment = service.addComment(cardId, "本文1");

    expect(comment.body).toBe("本文1");
    expect(commentRepo.findByCardId(cardId)).toHaveLength(1);
  });

  it("updateComment: 既存のコメントを更新できる", () => {
    const db = setupDb();
    const { service } = setupService(db);
    const cardId = insertCard(db);
    const comment = service.addComment(cardId, "元の本文");

    const updated = service.updateComment(comment.id, "更新後の本文");

    expect(updated?.body).toBe("更新後の本文");
  });

  it("updateComment: 存在しないIDの場合はundefinedを返す", () => {
    const db = setupDb();
    const { service } = setupService(db);

    expect(service.updateComment(999999, "更新後")).toBeUndefined();
  });

  it("deleteComment: 削除後は一覧から消える", () => {
    const db = setupDb();
    const { service, commentRepo } = setupService(db);
    const cardId = insertCard(db);
    const comment = service.addComment(cardId, "削除対象");

    service.deleteComment(comment.id);

    expect(commentRepo.findByCardId(cardId)).toHaveLength(0);
  });
});

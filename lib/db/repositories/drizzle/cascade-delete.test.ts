import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../../index";
import { runMigrations } from "../../migrate";
import { cleanupTmpDbFile, createTmpDbPath } from "../../test-utils";
import { createCardRepository } from "./card-repository";
import { createColumnRepository } from "./column-repository";
import { createCommentRepository } from "./comment-repository";
import { createLabelRepository } from "./label-repository";

describe("カード削除時の外部キーCASCADE", () => {
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

  it("cardを削除すると紐づくcommentsも自動的に削除される", () => {
    const db = setupDb();
    const columnRepo = createColumnRepository(db);
    const cardRepo = createCardRepository(db);
    const commentRepo = createCommentRepository(db);
    const column = columnRepo.create("未着手", 0);
    const card = cardRepo.create({ columnId: column.id, title: "タスク1" });
    commentRepo.create(card.id, "コメント1");
    commentRepo.create(card.id, "コメント2");

    cardRepo.delete(card.id);

    expect(commentRepo.findByCardId(card.id)).toHaveLength(0);
  });

  it("cardを削除すると紐づくcard_labelsも自動的に削除される", () => {
    const db = setupDb();
    const columnRepo = createColumnRepository(db);
    const cardRepo = createCardRepository(db);
    const labelRepo = createLabelRepository(db);
    const column = columnRepo.create("未着手", 0);
    const card = cardRepo.create({ columnId: column.id, title: "タスク1" });
    labelRepo.setLabelsForCard(card.id, ["緊急", "バグ"]);

    cardRepo.delete(card.id);

    expect(labelRepo.findByCardId(card.id)).toHaveLength(0);
  });

  it("cardを削除してもlabels自体（マスタ）は残る", () => {
    const db = setupDb();
    const columnRepo = createColumnRepository(db);
    const cardRepo = createCardRepository(db);
    const labelRepo = createLabelRepository(db);
    const column = columnRepo.create("未着手", 0);
    const card = cardRepo.create({ columnId: column.id, title: "タスク1" });
    const label = labelRepo.findOrCreateByName("緊急");
    labelRepo.setLabelsForCard(card.id, ["緊急"]);

    cardRepo.delete(card.id);

    const stillExists = labelRepo.findOrCreateByName("緊急");
    expect(stillExists.id).toBe(label.id);
  });
});

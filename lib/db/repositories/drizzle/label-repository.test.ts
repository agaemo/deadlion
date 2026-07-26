import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../../index";
import { runMigrations } from "../../migrate";
import { cards, columns } from "../../schema";
import { cleanupTmpDbFile, createTmpDbPath } from "../../test-utils";
import { createLabelRepository } from "./label-repository";

describe("createLabelRepository", () => {
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

  it("findOrCreateByName: 存在しない名前の場合は新規作成する", () => {
    const db = setupDb();
    const repo = createLabelRepository(db);

    const label = repo.findOrCreateByName("緊急");

    expect(label.name).toBe("緊急");
    expect(label.id).toBeDefined();
  });

  it("findOrCreateByName: 既存の名前の場合は同じIDを返し重複作成しない", () => {
    const db = setupDb();
    const repo = createLabelRepository(db);

    const first = repo.findOrCreateByName("緊急");
    const second = repo.findOrCreateByName("緊急");

    expect(second.id).toBe(first.id);
  });

  it("setLabelsForCard: 複数ラベルを紐付け、findByCardIdで取得できる", () => {
    const db = setupDb();
    const repo = createLabelRepository(db);
    const cardId = insertCard(db, "タスク1");

    repo.setLabelsForCard(cardId, ["緊急", "バグ"]);

    const labels = repo.findByCardId(cardId);
    const names = labels.map((label) => label.name).sort();
    expect(names).toEqual(["バグ", "緊急"]);
  });

  it("setLabelsForCard: 再度呼び出すと前回のラベルが入れ替わる", () => {
    const db = setupDb();
    const repo = createLabelRepository(db);
    const cardId = insertCard(db, "タスク1");

    repo.setLabelsForCard(cardId, ["緊急", "バグ"]);
    repo.setLabelsForCard(cardId, ["改善"]);

    const labels = repo.findByCardId(cardId);
    expect(labels.map((label) => label.name)).toEqual(["改善"]);
  });

  it("setLabelsForCard: 空配列を渡すとラベルが全て外れる", () => {
    const db = setupDb();
    const repo = createLabelRepository(db);
    const cardId = insertCard(db, "タスク1");
    repo.setLabelsForCard(cardId, ["緊急"]);

    repo.setLabelsForCard(cardId, []);

    expect(repo.findByCardId(cardId)).toHaveLength(0);
  });

  it("findByCardId: ラベルが無いカードは空配列を返す", () => {
    const db = setupDb();
    const repo = createLabelRepository(db);
    const cardId = insertCard(db, "タスク1");

    expect(repo.findByCardId(cardId)).toEqual([]);
  });
});

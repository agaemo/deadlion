import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../../index";
import { runMigrations } from "../../migrate";
import { cleanupTmpDbFile, createTmpDbPath } from "../../test-utils";
import { createColumnRepository } from "./column-repository";

describe("createColumnRepository", () => {
  const tmpPaths: string[] = [];

  afterEach(() => {
    for (const path of tmpPaths.splice(0)) {
      cleanupTmpDbFile(path);
    }
  });

  function setupRepo() {
    const path = createTmpDbPath();
    tmpPaths.push(path);
    const db = createDb(path);
    runMigrations(db);
    return createColumnRepository(db);
  }

  it("create: 作成した列がfindAllで取得できる", () => {
    const repo = setupRepo();

    const created = repo.create("未着手", 0);

    const all = repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(created.id);
    expect(all[0]?.name).toBe("未着手");
    expect(all[0]?.position).toBe(0);
  });

  it("count: 初期状態は0件", () => {
    const repo = setupRepo();

    expect(repo.count()).toBe(0);
  });

  it("count: createするたびに件数が増える", () => {
    const repo = setupRepo();

    repo.create("未着手", 0);
    repo.create("進行中", 1);

    expect(repo.count()).toBe(2);
  });

  it("delete: 削除した列はfindAllから消える", () => {
    const repo = setupRepo();
    const column = repo.create("未着手", 0);

    repo.delete(column.id);

    expect(repo.findAll().map((c) => c.id)).not.toContain(column.id);
  });

  it("delete: 他の列はfindAllに残る", () => {
    const repo = setupRepo();
    const toDelete = repo.create("未着手", 0);
    const toKeep = repo.create("進行中", 1);

    repo.delete(toDelete.id);

    const all = repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(toKeep.id);
  });

  it("updatePositions: 渡した順序でpositionが反映される", () => {
    const repo = setupRepo();
    const a = repo.create("A", 0);
    const b = repo.create("B", 1);
    const c = repo.create("C", 2);

    repo.updatePositions([c.id, a.id, b.id]);

    const all = repo.findAll();
    const positionById = new Map(all.map((col) => [col.id, col.position]));
    expect(positionById.get(c.id)).toBe(0);
    expect(positionById.get(a.id)).toBe(1);
    expect(positionById.get(b.id)).toBe(2);
  });
});

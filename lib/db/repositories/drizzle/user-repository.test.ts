import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../../index";
import { runMigrations } from "../../migrate";
import { cleanupTmpDbFile, createTmpDbPath } from "../../test-utils";
import { createUserRepository } from "./user-repository";

describe("createUserRepository", () => {
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
    return createUserRepository(db);
  }

  it("create: ユーザーを作成できる", () => {
    const repo = setupRepo();
    const user = repo.create({
      username: "alice",
      passwordHash: "hash",
      isAdmin: 0,
      mustChangePassword: 0,
    });
    expect(user.username).toBe("alice");
    expect(user.isAdmin).toBe(0);
  });

  it("findByUsername: 作成したユーザーを取得できる", () => {
    const repo = setupRepo();
    repo.create({ username: "bob", passwordHash: "h", isAdmin: 0, mustChangePassword: 0 });
    const found = repo.findByUsername("bob");
    expect(found?.username).toBe("bob");
  });

  it("findByUsername: 存在しないユーザーは undefined を返す", () => {
    const repo = setupRepo();
    expect(repo.findByUsername("nobody")).toBeUndefined();
  });

  it("findById: IDで取得できる", () => {
    const repo = setupRepo();
    const created = repo.create({ username: "carol", passwordHash: "h", isAdmin: 0, mustChangePassword: 0 });
    const found = repo.findById(created.id);
    expect(found?.id).toBe(created.id);
  });

  it("findAll: 全ユーザーを取得できる", () => {
    const repo = setupRepo();
    repo.create({ username: "u1", passwordHash: "h", isAdmin: 0, mustChangePassword: 0 });
    repo.create({ username: "u2", passwordHash: "h", isAdmin: 0, mustChangePassword: 0 });
    expect(repo.findAll()).toHaveLength(2);
  });

  it("deleteById: ユーザーを削除できる", () => {
    const repo = setupRepo();
    const user = repo.create({ username: "dave", passwordHash: "h", isAdmin: 0, mustChangePassword: 0 });
    repo.deleteById(user.id);
    expect(repo.findById(user.id)).toBeUndefined();
  });

  it("updatePassword: パスワードハッシュを更新できる", () => {
    const repo = setupRepo();
    const user = repo.create({ username: "eve", passwordHash: "old", isAdmin: 0, mustChangePassword: 0 });
    repo.updatePassword(user.id, "new");
    expect(repo.findById(user.id)?.passwordHash).toBe("new");
  });

  it("setMustChangePassword: フラグを更新できる", () => {
    const repo = setupRepo();
    const user = repo.create({ username: "frank", passwordHash: "h", isAdmin: 0, mustChangePassword: 1 });
    repo.setMustChangePassword(user.id, 0);
    expect(repo.findById(user.id)?.mustChangePassword).toBe(0);
  });
});

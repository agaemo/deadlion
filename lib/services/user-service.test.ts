import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { createUserRepository } from "../db/repositories/drizzle/user-repository";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { createUserService } from "./user-service";

describe("createUserService", () => {
  const tmpPaths: string[] = [];

  afterEach(() => {
    for (const path of tmpPaths.splice(0)) {
      cleanupTmpDbFile(path);
    }
  });

  function setupService() {
    const path = createTmpDbPath();
    tmpPaths.push(path);
    const db = createDb(path);
    runMigrations(db);
    const userRepo = createUserRepository(db);
    return { service: createUserService({ userRepo }), userRepo };
  }

  describe("createUser", () => {
    it("新しいユーザーを作成できる", () => {
      const { service } = setupService();
      const result = service.createUser("alice", "password123");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.username).toBe("alice");
        expect(result.data.mustChangePassword).toBe(1);
      }
    });

    it("重複ユーザー名はエラーを返す", () => {
      const { service } = setupService();
      service.createUser("alice", "password123");
      const result = service.createUser("alice", "other");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/すでに使用/);
      }
    });
  });

  describe("deleteUser", () => {
    it("他のユーザーを削除できる", () => {
      const { service } = setupService();
      const created = service.createUser("bob", "pass");
      if (!created.ok) throw new Error("setup failed");
      const result = service.deleteUser(created.data.id, 999);
      expect(result.ok).toBe(true);
    });

    it("自分自身は削除できない", () => {
      const { service } = setupService();
      const created = service.createUser("carol", "pass");
      if (!created.ok) throw new Error("setup failed");
      const result = service.deleteUser(created.data.id, created.data.id);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/自分自身/);
      }
    });

    it("存在しないユーザーはエラーを返す", () => {
      const { service } = setupService();
      const result = service.deleteUser(9999, 1);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/見つかりません/);
      }
    });
  });

  describe("changePassword", () => {
    it("正しい現在パスワードで変更できる", () => {
      const { service } = setupService();
      const created = service.createUser("dave", "old-password");
      if (!created.ok) throw new Error("setup failed");
      const result = service.changePassword(created.data.id, "old-password", "new-password");
      expect(result.ok).toBe(true);
    });

    it("誤った現在パスワードはエラーを返す", () => {
      const { service } = setupService();
      const created = service.createUser("eve", "correct");
      if (!created.ok) throw new Error("setup failed");
      const result = service.changePassword(created.data.id, "wrong", "new");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/正しくありません/);
      }
    });

    it("パスワード変更後は mustChangePassword が 0 になる", () => {
      const { service, userRepo } = setupService();
      const created = service.createUser("frank", "old-password");
      if (!created.ok) throw new Error("setup failed");
      const result = service.changePassword(created.data.id, "old-password", "new-password");
      expect(result.ok).toBe(true);
      expect(userRepo.findById(created.data.id)?.mustChangePassword).toBe(0);
    });

    it("存在しないユーザーはエラーを返す", () => {
      const { service } = setupService();
      const result = service.changePassword(9999, "old", "new");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/見つかりません/);
      }
    });
  });

  describe("listUsers", () => {
    it("全ユーザーを返す", () => {
      const { service } = setupService();
      service.createUser("g1", "pass");
      service.createUser("g2", "pass");
      expect(service.listUsers()).toHaveLength(2);
    });
  });
});

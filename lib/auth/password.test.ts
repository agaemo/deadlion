import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("lib/auth/password", () => {
  describe("hashPassword", () => {
    it("同じパスワードでも呼び出すたびに異なる文字列を返す（saltが異なるため）", () => {
      const password = "correct-horse-battery-staple";

      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("空文字列パスワードでも例外を投げない", () => {
      expect(() => hashPassword("")).not.toThrow();
    });
  });

  describe("verifyPassword", () => {
    it("hashPasswordが生成したハッシュに対し、同じ平文パスワードを検証するとtrueを返す", () => {
      const password = "correct-horse-battery-staple";
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("hashPasswordが生成したハッシュに対し、異なる平文パスワードを検証するとfalseを返す", () => {
      const hash = hashPassword("correct-horse-battery-staple");

      expect(verifyPassword("wrong-password", hash)).toBe(false);
    });

    it("空文字列パスワードでハッシュ化・検証しても例外を投げず、正しく照合できる", () => {
      const hash = hashPassword("");

      expect(() => verifyPassword("", hash)).not.toThrow();
      expect(verifyPassword("", hash)).toBe(true);
    });

    it("不正な形式のstoredHash（ランダムな文字列）を渡すと例外を投げずにfalseを返す", () => {
      expect(() => verifyPassword("some-password", "not-a-valid-hash")).not.toThrow();
      expect(verifyPassword("some-password", "not-a-valid-hash")).toBe(false);
    });

    it("空文字列のstoredHashを渡しても例外を投げずにfalseを返す", () => {
      expect(() => verifyPassword("some-password", "")).not.toThrow();
      expect(verifyPassword("some-password", "")).toBe(false);
    });
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { users } from "../db/schema";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { hashPassword } from "./password";
import { createAuthorize } from "./authorize";

describe("createAuthorize", () => {
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

  function insertUser(
    db: ReturnType<typeof createDb>,
    username: string,
    password: string,
  ): number {
    const row = db
      .insert(users)
      .values({
        username,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      })
      .returning({ id: users.id })
      .get();

    return row.id;
  }

  it("正しいusername・passwordの場合、idとnameを返す", () => {
    const db = setupDb();
    const userId = insertUser(db, "taro", "correct-password");
    const authorize = createAuthorize(db);

    const result = authorize("taro", "correct-password");

    expect(result).toEqual({ id: String(userId), name: "taro" });
  });

  it("存在しないusernameの場合、nullを返す", () => {
    const db = setupDb();
    const authorize = createAuthorize(db);

    const result = authorize("no-such-user", "whatever");

    expect(result).toBeNull();
  });

  it("usernameは存在するがpasswordが間違っている場合、nullを返す", () => {
    const db = setupDb();
    insertUser(db, "taro", "correct-password");
    const authorize = createAuthorize(db);

    const result = authorize("taro", "wrong-password");

    expect(result).toBeNull();
  });

  it("usernameが文字列でない場合、DBに問い合わせずnullを返す", () => {
    const db = setupDb();
    insertUser(db, "taro", "correct-password");
    const authorize = createAuthorize(db);

    const result = authorize(undefined, "correct-password");

    expect(result).toBeNull();
  });

  it("passwordが文字列でない場合、DBに問い合わせずnullを返す", () => {
    const db = setupDb();
    insertUser(db, "taro", "correct-password");
    const authorize = createAuthorize(db);

    const result = authorize("taro", 12345);

    expect(result).toBeNull();
  });

  it("usersテーブルが0件の場合、例外を投げずnullを返す", () => {
    const db = setupDb();
    const authorize = createAuthorize(db);

    const result = authorize("taro", "correct-password");

    expect(result).toBeNull();
  });
});

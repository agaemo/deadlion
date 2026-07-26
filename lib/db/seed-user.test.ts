import { afterEach, describe, expect, it, vi } from "vitest";
import { createDb } from "./index";
import { runMigrations } from "./migrate";
import { users } from "./schema";
import { seedUser } from "./seed-user";
import { cleanupTmpDbFile, createTmpDbPath } from "./test-utils";

describe("lib/db/seed-user", () => {
  const tmpPaths: string[] = [];

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it("usersが0件のとき、環境変数の値から1件だけINSERTされる", () => {
    const db = setupDb();
    vi.stubEnv("AUTH_USERNAME", "test-admin");
    vi.stubEnv("AUTH_PASSWORD_HASH", "scrypt$dummy-hash-value");

    seedUser(db);

    const rows = db.select().from(users).all();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.username).toBe("test-admin");
    expect(rows[0]?.passwordHash).toBe("scrypt$dummy-hash-value");
  });

  it("usersが既に1件以上あるとき、実行してもレコード数が増えない", () => {
    const db = setupDb();
    db.insert(users)
      .values({
        username: "existing-user",
        passwordHash: "scrypt$existing-hash",
        createdAt: new Date().toISOString(),
      })
      .run();

    vi.stubEnv("AUTH_USERNAME", "test-admin");
    vi.stubEnv("AUTH_PASSWORD_HASH", "scrypt$dummy-hash-value");

    seedUser(db);

    const rows = db.select().from(users).all();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.username).toBe("existing-user");
  });
});

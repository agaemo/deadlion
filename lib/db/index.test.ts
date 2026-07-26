import { existsSync } from "node:fs";
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDb } from "./index";
import { cleanupTmpDbFile, createTmpDbPath } from "./test-utils";

describe("lib/db/index", () => {
  const tmpPaths: string[] = [];

  afterEach(() => {
    vi.unstubAllEnvs();
    for (const path of tmpPaths.splice(0)) {
      cleanupTmpDbFile(path);
    }
  });

  it("createDb: 引数で渡したパスにSQLite接続を作成する", () => {
    const path = createTmpDbPath();
    tmpPaths.push(path);

    createDb(path);

    expect(existsSync(path)).toBe(true);
  });

  it("createDb: 接続時にPRAGMA foreign_keysが有効になっている", () => {
    const path = createTmpDbPath();
    tmpPaths.push(path);

    const db = createDb(path);
    const result = db.get<{ foreign_keys: number }>(
      sql`PRAGMA foreign_keys`,
    );

    expect(result?.foreign_keys).toBe(1);
  });

  it("createDb: 引数省略時はDATABASE_URL環境変数のパスに接続する", () => {
    const path = createTmpDbPath();
    tmpPaths.push(path);
    vi.stubEnv("DATABASE_URL", path);

    createDb();

    expect(existsSync(path)).toBe(true);
  });
});

import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "./index";
import { runMigrations } from "./migrate";
import { cleanupTmpDbFile, createTmpDbPath } from "./test-utils";

const EXPECTED_TABLES = [
  "users",
  "columns",
  "cards",
  "labels",
  "card_labels",
  "comments",
];

describe("lib/db/migrate", () => {
  const tmpPaths: string[] = [];

  afterEach(() => {
    for (const path of tmpPaths.splice(0)) {
      cleanupTmpDbFile(path);
    }
  });

  it("runMigrations: drizzle/配下のマイグレーションを適用し、全6テーブルが作成される", () => {
    const path = createTmpDbPath();
    tmpPaths.push(path);
    const db = createDb(path);

    runMigrations(db);

    const rows = db.all<{ name: string }>(
      sql`SELECT name FROM sqlite_master WHERE type = 'table'`,
    );
    const tableNames = rows.map((row) => row.name);

    for (const table of EXPECTED_TABLES) {
      expect(tableNames).toContain(table);
    }
  });

  it("runMigrations: 適用後もPRAGMA foreign_keysが有効なまま維持される", () => {
    const path = createTmpDbPath();
    tmpPaths.push(path);
    const db = createDb(path);

    runMigrations(db);

    const result = db.get<{ foreign_keys: number }>(
      sql`PRAGMA foreign_keys`,
    );
    expect(result?.foreign_keys).toBe(1);
  });
});

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export function createDb(path?: string) {
  const dbPath = path ?? process.env.DATABASE_URL ?? "./data/app.db";
  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = createDb();

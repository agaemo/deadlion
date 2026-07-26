import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { createDb } from "./index";

export function runMigrations(
  db: ReturnType<typeof createDb>,
  migrationsFolder = "./drizzle",
) {
  migrate(db, { migrationsFolder });
}

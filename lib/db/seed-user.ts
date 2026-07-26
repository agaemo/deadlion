import { users } from "./schema";
import type { createDb } from "./index";

export function seedUser(db: ReturnType<typeof createDb>) {
  const existing = db.select().from(users).all();
  if (existing.length > 0) return;

  const username = process.env.AUTH_USERNAME;
  const passwordHash = process.env.AUTH_PASSWORD_HASH;
  if (!username || !passwordHash) return;

  db.insert(users)
    .values({
      username,
      passwordHash,
      isAdmin: 1,
      mustChangePassword: 1,
      createdAt: new Date().toISOString(),
    })
    .run();
}

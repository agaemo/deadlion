import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import type { createDb } from "@/lib/db";
import type { IUserRepository } from "../interfaces/user-repository";

export function createUserRepository(
  db: ReturnType<typeof createDb>,
): IUserRepository {
  return {
    findAll() {
      return db.select().from(users).all();
    },

    findById(id) {
      return db.select().from(users).where(eq(users.id, id)).get();
    },

    findByUsername(username) {
      return db.select().from(users).where(eq(users.username, username)).get();
    },

    create({ username, passwordHash, isAdmin, mustChangePassword }) {
      const now = new Date().toISOString();
      const result = db
        .insert(users)
        .values({
          username,
          passwordHash,
          isAdmin,
          mustChangePassword,
          createdAt: now,
        })
        .returning()
        .get();
      return result;
    },

    deleteById(id) {
      db.delete(users).where(eq(users.id, id)).run();
    },

    updatePassword(id, passwordHash) {
      db.update(users).set({ passwordHash }).where(eq(users.id, id)).run();
    },

    setMustChangePassword(id, value) {
      db.update(users)
        .set({ mustChangePassword: value })
        .where(eq(users.id, id))
        .run();
    },
  };
}

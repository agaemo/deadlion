import { eq } from "drizzle-orm";
import type { createDb } from "../db/index";
import { users } from "../db/schema";
import { verifyPassword } from "./password";

export function createAuthorize(db: ReturnType<typeof createDb>) {
  return function authorize(
    username: unknown,
    password: unknown,
  ): {
    id: string;
    name: string;
    isAdmin: boolean;
    mustChangePassword: boolean;
  } | null {
    if (typeof username !== "string" || typeof password !== "string") {
      return null;
    }

    const user = db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();
    if (!user) return null;

    if (!verifyPassword(password, user.passwordHash)) return null;

    return {
      id: String(user.id),
      name: user.username,
      isAdmin: user.isAdmin === 1,
      mustChangePassword: user.mustChangePassword === 1,
    };
  };
}

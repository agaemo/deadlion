import { eq } from "drizzle-orm";
import type { createDb } from "../../index";
import { comments } from "../../schema";
import type { CommentRepository } from "../interfaces/comment-repository";

export function createCommentRepository(
  db: ReturnType<typeof createDb>,
): CommentRepository {
  return {
    findByCardId(cardId) {
      return db.select().from(comments).where(eq(comments.cardId, cardId)).all();
    },
    create(cardId, body) {
      const now = new Date().toISOString();
      return db
        .insert(comments)
        .values({ cardId, body, createdAt: now, updatedAt: now })
        .returning()
        .get();
    },
    update(id, body) {
      const existing = db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .get();
      if (!existing) return undefined;

      return db
        .update(comments)
        .set({ body, updatedAt: new Date().toISOString() })
        .where(eq(comments.id, id))
        .returning()
        .get();
    },
    delete(id) {
      db.delete(comments).where(eq(comments.id, id)).run();
    },
  };
}

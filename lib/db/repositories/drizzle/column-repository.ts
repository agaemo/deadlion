import { eq } from "drizzle-orm";
import type { createDb } from "../../index";
import { columns } from "../../schema";
import type { ColumnRepository } from "../interfaces/column-repository";

export function createColumnRepository(
  db: ReturnType<typeof createDb>,
): ColumnRepository {
  return {
    findAll() {
      return db.select().from(columns).orderBy(columns.position).all();
    },
    count() {
      return db.select().from(columns).all().length;
    },
    create(name, position) {
      return db
        .insert(columns)
        .values({ name, position, createdAt: new Date().toISOString() })
        .returning()
        .get();
    },
    rename(id, name) {
      return db
        .update(columns)
        .set({ name })
        .where(eq(columns.id, id))
        .returning()
        .get();
    },
    delete(id) {
      db.delete(columns).where(eq(columns.id, id)).run();
    },
    updatePositions(orderedIds) {
      orderedIds.forEach((id, index) => {
        db.update(columns)
          .set({ position: index })
          .where(eq(columns.id, id))
          .run();
      });
    },
  };
}

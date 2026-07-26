import { eq } from "drizzle-orm";
import type { createDb } from "../../index";
import { cards } from "../../schema";
import type { CardRepository } from "../interfaces/card-repository";

export function createCardRepository(
  db: ReturnType<typeof createDb>,
): CardRepository {
  function maxPositionInColumn(columnId: number): number {
    const rows = db
      .select()
      .from(cards)
      .where(eq(cards.columnId, columnId))
      .all();
    if (rows.length === 0) return -1;
    return Math.max(...rows.map((row) => row.position));
  }

  return {
    findById(id) {
      return db.select().from(cards).where(eq(cards.id, id)).get();
    },
    findByColumnId(columnId) {
      return db.select().from(cards).where(eq(cards.columnId, columnId)).all();
    },
    findAll() {
      return db.select().from(cards).all();
    },
    maxPositionInColumn,
    create(input) {
      const now = new Date().toISOString();
      const position = maxPositionInColumn(input.columnId) + 1;
      return db
        .insert(cards)
        .values({
          columnId: input.columnId,
          title: input.title,
          description: input.description ?? null,
          deadline: input.deadline ?? null,
          targetDate: input.targetDate ?? null,
          personMonth: input.personMonth ?? null,
          startDate: input.startDate ?? null,
          color: input.color ?? null,
          position,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
    },
    update(id, input) {
      const existing = db.select().from(cards).where(eq(cards.id, id)).get();
      if (!existing) return undefined;

      const { labelNames: _labelNames, ...cardFields } = input;
      return db
        .update(cards)
        .set({ ...cardFields, updatedAt: new Date().toISOString() })
        .where(eq(cards.id, id))
        .returning()
        .get();
    },
    delete(id) {
      db.delete(cards).where(eq(cards.id, id)).run();
    },
    updateColumnAndPosition(id, columnId, position) {
      db.update(cards)
        .set({ columnId, position, updatedAt: new Date().toISOString() })
        .where(eq(cards.id, id))
        .run();
    },
    moveAllToColumn(fromColumnId, toColumnId) {
      db.update(cards)
        .set({ columnId: toColumnId, updatedAt: new Date().toISOString() })
        .where(eq(cards.columnId, fromColumnId))
        .run();
    },
  };
}

import { eq, inArray } from "drizzle-orm";
import type { createDb } from "../../index";
import { cardLabels, labels } from "../../schema";
import type { Label } from "@/lib/types";
import type { LabelRepository } from "../interfaces/label-repository";

export function createLabelRepository(
  db: ReturnType<typeof createDb>,
): LabelRepository {
  function findOrCreateByName(name: string) {
    const existing = db.select().from(labels).where(eq(labels.name, name)).get();
    if (existing) return existing;
    return db.insert(labels).values({ name }).returning().get();
  }

  return {
    findOrCreateByName,
    findByCardId(cardId) {
      return db
        .select({ id: labels.id, name: labels.name })
        .from(cardLabels)
        .innerJoin(labels, eq(cardLabels.labelId, labels.id))
        .where(eq(cardLabels.cardId, cardId))
        .all();
    },
    findByCardIds(cardIds) {
      const result = new Map<number, Label[]>();
      if (cardIds.length === 0) return result;
      const rows = db
        .select({ cardId: cardLabels.cardId, id: labels.id, name: labels.name })
        .from(cardLabels)
        .innerJoin(labels, eq(cardLabels.labelId, labels.id))
        .where(inArray(cardLabels.cardId, cardIds))
        .all();
      for (const row of rows) {
        const list = result.get(row.cardId) ?? [];
        list.push({ id: row.id, name: row.name });
        result.set(row.cardId, list);
      }
      return result;
    },
    setLabelsForCard(cardId, labelNames) {
      db.delete(cardLabels).where(eq(cardLabels.cardId, cardId)).run();
      for (const name of labelNames) {
        const label = findOrCreateByName(name);
        db.insert(cardLabels).values({ cardId, labelId: label.id }).run();
      }
    },
  };
}

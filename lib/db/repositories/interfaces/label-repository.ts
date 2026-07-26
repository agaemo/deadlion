import type { Label } from "@/lib/types";

export interface LabelRepository {
  findOrCreateByName(name: string): Label;
  findByCardId(cardId: number): Label[];
  setLabelsForCard(cardId: number, labelNames: string[]): void;
}

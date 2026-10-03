import type { CardRepository } from "../db/repositories/interfaces/card-repository";
import type { ColumnRepository } from "../db/repositories/interfaces/column-repository";
import type { LabelRepository } from "../db/repositories/interfaces/label-repository";
import type { CardWithLabels, Column } from "@/lib/types";

const DEFAULT_COLUMNS = ["未整理", "未着手", "進行中", "完了", "対応なし"];

type Deps = {
  columnRepo: ColumnRepository;
  cardRepo: CardRepository;
  labelRepo: LabelRepository;
};

export function createBoardService(deps: Deps) {
  function getBoard(): Array<Column & { cards: CardWithLabels[] }> {
    if (deps.columnRepo.count() === 0) {
      DEFAULT_COLUMNS.forEach((name, index) => {
        deps.columnRepo.create(name, index);
      });
    }

    const columns = deps.columnRepo.findAll();
    const allCards = deps.cardRepo.findAll();
    const cardIds = allCards.map((c) => c.id);
    const labelsByCardId = deps.labelRepo.findByCardIds(cardIds);

    const cardsByColumnId = new Map<number, CardWithLabels[]>();
    for (const card of allCards) {
      const list = cardsByColumnId.get(card.columnId) ?? [];
      list.push({ ...card, labels: labelsByCardId.get(card.id) ?? [] });
      cardsByColumnId.set(card.columnId, list);
    }

    return columns.map((column) => ({
      ...column,
      cards: cardsByColumnId.get(column.id) ?? [],
    }));
  }

  return { getBoard };
}

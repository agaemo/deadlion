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

    return deps.columnRepo.findAll().map((column) => ({
      ...column,
      cards: deps.cardRepo.findByColumnId(column.id).map((card) => ({
        ...card,
        labels: deps.labelRepo.findByCardId(card.id),
      })),
    }));
  }

  return { getBoard };
}

import type { CardRepository } from "../db/repositories/interfaces/card-repository";
import type { ColumnRepository } from "../db/repositories/interfaces/column-repository";

type Deps = {
  columnRepo: ColumnRepository;
  cardRepo: CardRepository;
};

export function createColumnService(deps: Deps) {
  function createColumn(name: string) {
    const position = deps.columnRepo.findAll().length;
    return deps.columnRepo.create(name, position);
  }

  function deleteColumn(id: number) {
    const misc = deps.columnRepo.findAll().find((column) => column.name === "未整理");
    if (!misc) {
      deps.columnRepo.delete(id);
      return;
    }
    if (misc.id === id) {
      // 「未整理」列は他の列削除時の受け皿のため削除できない。操作を無視する。
      return;
    }
    deps.cardRepo.moveAllToColumn(id, misc.id);
    deps.columnRepo.delete(id);
  }

  function renameColumn(id: number, name: string) {
    return deps.columnRepo.rename(id, name);
  }

  function reorderColumns(orderedIds: number[]) {
    deps.columnRepo.updatePositions(orderedIds);
  }

  return { createColumn, deleteColumn, renameColumn, reorderColumns };
}

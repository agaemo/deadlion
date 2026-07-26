import type { Card, CreateCardInput, UpdateCardInput } from "@/lib/types";

export interface CardRepository {
  findById(id: number): Card | undefined;
  findByColumnId(columnId: number): Card[];
  findAll(): Card[];
  maxPositionInColumn(columnId: number): number;
  create(input: CreateCardInput): Card;
  update(id: number, input: UpdateCardInput): Card | undefined;
  delete(id: number): void;
  updateColumnAndPosition(id: number, columnId: number, position: number): void;
  moveAllToColumn(fromColumnId: number, toColumnId: number): void;
}

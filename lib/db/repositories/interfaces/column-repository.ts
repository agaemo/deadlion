import type { Column } from "@/lib/types";

export interface ColumnRepository {
  findAll(): Column[];
  count(): number;
  create(name: string, position: number): Column;
  rename(id: number, name: string): Column;
  delete(id: number): void;
  updatePositions(orderedIds: number[]): void;
}

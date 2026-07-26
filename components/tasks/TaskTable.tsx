"use client";

import { LabelChip } from "@/components/ui/LabelChip";
import type { CardWithLabels } from "@/lib/types";

export type SortKey =
  | "title"
  | "column"
  | "createdAt"
  | "deadline"
  | "targetDate"
  | "startDate";

type ColumnDef = {
  key: SortKey | null;
  label: string;
};

// US-013: ソート対象はタイトル・列・作成日・納期・目標期日・開始日のみ。
// ラベル列はソート機能を持たせない。
const COLUMN_DEFS: ColumnDef[] = [
  { key: "title", label: "タイトル" },
  { key: "column", label: "列" },
  { key: null, label: "ラベル" },
  { key: "deadline", label: "納期" },
  { key: "targetDate", label: "目標期日" },
  { key: "startDate", label: "開始日" },
  { key: "createdAt", label: "作成日" },
];

function formatDate(value: string | null): string {
  if (!value) return "-";
  return value.slice(0, 10);
}

export function TaskTable({
  tasks,
  columnMap,
  sort,
  order,
  query,
  onSort,
  onRowClick,
}: {
  tasks: CardWithLabels[];
  columnMap: Record<number, string>;
  sort?: SortKey;
  order?: "asc" | "desc";
  query: string;
  onSort: (key: SortKey) => void;
  onRowClick: (cardId: number) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded border border-border bg-surface p-8 text-center text-sm text-subtext">
        {query.trim()
          ? "該当するタスクが見つかりませんでした"
          : "登録されているタスクはまだありません"}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-border bg-surface">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {COLUMN_DEFS.map((col) => {
              const isSorted = col.key !== null && sort === col.key;
              return (
                <th
                  key={col.label}
                  scope="col"
                  className="px-4 py-2 font-medium text-subtext"
                >
                  {col.key ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key as SortKey)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      aria-sort={
                        isSorted
                          ? order === "desc"
                            ? "descending"
                            : "ascending"
                          : "none"
                      }
                    >
                      {col.label}
                      {isSorted && (
                        <span aria-hidden="true">
                          {order === "desc" ? "▼" : "▲"}
                        </span>
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onRowClick(task.id)}
              className="cursor-pointer border-b border-border last:border-b-0 hover:bg-primary-100/30"
            >
              <td className="px-4 py-2 font-medium text-foreground">
                {task.title}
              </td>
              <td className="px-4 py-2 text-foreground">
                {columnMap[task.columnId] ?? "-"}
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((label) => (
                    <LabelChip key={label.id} name={label.name} />
                  ))}
                </div>
              </td>
              <td className="px-4 py-2 text-foreground">
                {formatDate(task.deadline)}
              </td>
              <td className="px-4 py-2 text-foreground">
                {formatDate(task.targetDate)}
              </td>
              <td className="px-4 py-2 text-foreground">
                {formatDate(task.startDate)}
              </td>
              <td className="px-4 py-2 text-subtext">
                {formatDate(task.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

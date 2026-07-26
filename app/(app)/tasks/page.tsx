export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { createColumnRepository } from "@/lib/db/repositories/drizzle/column-repository";
import { taskService } from "@/lib/services/registry";
import { TasksPageClient } from "@/components/tasks/TasksPageClient";
import type { SortKey } from "@/components/tasks/TaskTable";

const SORT_KEYS: SortKey[] = [
  "title",
  "column",
  "createdAt",
  "deadline",
  "targetDate",
  "startDate",
];

function isSortKey(value: string | undefined): value is SortKey {
  return !!value && (SORT_KEYS as string[]).includes(value);
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; order?: string; query?: string }>;
}) {
  const params = await searchParams;

  const sort = isSortKey(params.sort) ? params.sort : undefined;
  const order =
    sort && params.order === "desc" ? "desc" : sort ? "asc" : undefined;
  const query = params.query ?? "";

  const tasks = taskService.getTasks({
    sort,
    order,
    query: query || undefined,
  });

  // taskService.getTasks は columnId でしかソートできないため、
  // 列名の表示には別途列一覧を取得して columnId → columnName のマップを作る。
  const columnRepo = createColumnRepository(db);
  const columnMap = Object.fromEntries(
    columnRepo.findAll().map((column) => [column.id, column.name]),
  );

  return (
    <TasksPageClient
      tasks={tasks}
      columnMap={columnMap}
      sort={sort}
      order={order}
      query={query}
    />
  );
}

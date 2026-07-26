"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardModal } from "@/components/card/CardModal";
import type { CardWithLabels } from "@/lib/types";
import { SearchBar } from "./SearchBar";
import { TaskTable, type SortKey } from "./TaskTable";

type Order = "asc" | "desc";

/**
 * タスク一覧画面のクライアント側の状態管理。
 * ソート・検索の状態はURLクエリパラメータ（sort/order/query）で管理し、
 * router.replace によるクライアント側遷移（ページ全体のリロードなし）で
 * サーバーから最新のタスク一覧を取得し直す。
 */
export function TasksPageClient({
  tasks,
  columnMap,
  sort,
  order,
  query,
}: {
  tasks: CardWithLabels[];
  columnMap: Record<number, string>;
  sort?: SortKey;
  order?: Order;
  query: string;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | undefined>(
    undefined,
  );

  function navigate(next: {
    sort?: SortKey;
    order?: Order;
    query?: string;
  }) {
    const merged = {
      sort: next.sort ?? sort,
      order: next.order ?? order,
      query: next.query !== undefined ? next.query : query,
    };
    const params = new URLSearchParams();
    if (merged.sort) params.set("sort", merged.sort);
    if (merged.sort && merged.order) params.set("order", merged.order);
    if (merged.query) params.set("query", merged.query);
    const qs = params.toString();
    router.replace(qs ? `/tasks?${qs}` : "/tasks", { scroll: false });
  }

  function handleSort(key: SortKey) {
    if (sort === key) {
      navigate({ sort: key, order: order === "asc" ? "desc" : "asc" });
    } else {
      navigate({ sort: key, order: "asc" });
    }
  }

  function handleSearch(value: string) {
    navigate({ query: value });
  }

  function handleRowClick(cardId: number) {
    setSelectedCardId(cardId);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="font-heading text-xl font-bold text-foreground">
        タスク一覧
      </h1>

      <SearchBar defaultValue={query} onSearch={handleSearch} />

      <TaskTable
        tasks={tasks}
        columnMap={columnMap}
        sort={sort}
        order={order}
        query={query}
        onSort={handleSort}
        onRowClick={handleRowClick}
      />

      <CardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cardId={selectedCardId}
        onSaved={() => {
          setModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

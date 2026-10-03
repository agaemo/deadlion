"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createColumn, deleteColumn, renameColumn } from "@/actions/columns";
import type { BoardColumn } from "./useDragAndDrop";

type Props = {
  columns: BoardColumn[];
};

export function useColumnActions({ columns }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [newColumnName, setNewColumnName] = useState("");
  const [columnError, setColumnError] = useState<string | null>(null);

  async function handleAddColumn() {
    const name = newColumnName.trim();
    if (!name) {
      setColumnError("列名を入力してください");
      return;
    }
    const result = await createColumn({ name });
    if (!result.ok) {
      setColumnError(result.error);
      return;
    }
    setColumnError(null);
    setNewColumnName("");
    startTransition(() => router.refresh());
  }

  async function handleRenameColumn(columnId: number, name: string) {
    try {
      await renameColumn({ id: columnId, name });
    } finally {
      startTransition(() => router.refresh());
    }
  }

  async function handleDeleteColumn(columnId: number) {
    const column = columns.find((c) => c.id === columnId);
    const confirmed = window.confirm(
      column
        ? `列「${column.name}」を削除しますか？所属するカードは「未整理」列へ移動します。`
        : "列を削除しますか？",
    );
    if (!confirmed) return;
    try {
      await deleteColumn({ id: columnId });
    } finally {
      startTransition(() => router.refresh());
    }
  }

  return {
    newColumnName,
    setNewColumnName,
    columnError,
    setColumnError,
    handleAddColumn,
    handleRenameColumn,
    handleDeleteColumn,
  };
}

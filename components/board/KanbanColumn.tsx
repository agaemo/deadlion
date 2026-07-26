"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CardWithLabels, Column } from "@/lib/types";
import type { DragOverInfo } from "./KanbanBoard";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({
  column,
  dragOverInfo,
  onCardClick,
  onAddCard,
  onDeleteColumn,
  onRenameColumn,
}: {
  column: Column & { cards: CardWithLabels[] };
  dragOverInfo: DragOverInfo;
  onCardClick: (cardId: number) => void;
  onAddCard: (columnId: number) => void;
  onDeleteColumn: (columnId: number) => void;
  onRenameColumn: (columnId: number, name: string) => void;
}) {
  const isMisc = column.name === "未整理";
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `col-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  function startEditing() {
    setEditName(column.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const name = editName.trim();
    if (name && name !== column.name) {
      onRenameColumn(column.id, name);
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditName(column.name);
    setIsEditing(false);
  }

  const cardIds = useMemo(
    () => column.cards.map((card) => `card-${card.id}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [column.cards.map((c) => c.id).join(",")],
  );

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: transition ?? undefined,
    opacity: isDragging ? 0 : 1,
  };

  const showPlaceholder = dragOverInfo?.targetColumnId === column.id;
  const placeholderIndex = showPlaceholder ? dragOverInfo!.targetIndex : -1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-background"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between gap-2 rounded-t-lg border-b border-border px-3 py-2 active:cursor-grabbing"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  commitEdit();
                } else if (e.key === "Escape") {
                  cancelEdit();
                }
              }}
              onBlur={commitEdit}
              className="h-6 py-0 text-sm font-semibold"
              aria-label="列名を編集"
            />
          ) : (
            <h2 className="font-heading truncate text-sm font-semibold text-foreground">
              {column.name}
            </h2>
          )}
          <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs text-subtext">
            {column.cards.length}
          </span>
        </div>
        {!isMisc && (
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              className="px-2 py-1 text-xs text-subtext"
              onClick={(e) => {
                e.stopPropagation();
                startEditing();
              }}
              aria-label={`${column.name}列の名前を変更`}
            >
              編集
            </Button>
            <Button
              variant="ghost"
              className="px-2 py-1 text-xs text-subtext hover:text-error"
              onClick={() => onDeleteColumn(column.id)}
              aria-label={`${column.name}列を削除`}
            >
              削除
            </Button>
          </div>
        )}
      </div>

      <div className="flex min-h-[100px] flex-1 flex-col gap-2 p-2">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.length === 0 && !showPlaceholder ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-border py-6 text-xs text-subtext">
              カードはありません
            </div>
          ) : (
            <>
              {column.cards.map((card, index) => (
                <div key={card.id}>
                  {showPlaceholder && placeholderIndex === index && (
                    <div className="mb-2 min-h-[60px] rounded border-2 border-dashed border-accent opacity-50" />
                  )}
                  <KanbanCard
                    card={card}
                    onClick={() => onCardClick(card.id)}
                  />
                </div>
              ))}
              {showPlaceholder && placeholderIndex >= column.cards.length && (
                <div className="min-h-[60px] rounded border-2 border-dashed border-accent opacity-50" />
              )}
            </>
          )}
        </SortableContext>
      </div>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          className="w-full justify-center text-sm"
          onClick={() => onAddCard(column.id)}
        >
          + カード追加
        </Button>
      </div>
    </div>
  );
}

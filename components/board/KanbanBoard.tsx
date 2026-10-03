"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CardModal } from "@/components/card/CardModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CardWithLabels, Column } from "@/lib/types";
import { useColumnActions } from "@/hooks/useColumnActions";
import { useDragAndDrop, type BoardColumn, type DragOverInfo } from "@/hooks/useDragAndDrop";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";

export type { DragOverInfo };

type InitialColumn = Column & { cards: CardWithLabels[] };

function normalize(cols: InitialColumn[]): BoardColumn[] {
  return cols.map((c) => ({
    ...c,
    cards: [...c.cards].sort((a, b) => a.position - b.position),
  }));
}

export function KanbanBoard({ initialColumns }: { initialColumns: InitialColumn[] }) {
  const router = useRouter();
  const [columns, setColumns] = useState<BoardColumn[]>(() => normalize(initialColumns));
  const [modalState, setModalState] = useState<{
    open: boolean;
    cardId?: number;
    defaultColumnId?: number;
  }>({ open: false });
  const [, startTransition] = useTransition();
  const [hasOverflow, setHasOverflow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // router.refresh() で key が変わりリマウントされるため、sessionStorage でスクロール位置を引き継ぐ
  useLayoutEffect(() => {
    const saved = sessionStorage.getItem("kanbanScrollLeft");
    if (saved && scrollRef.current) {
      scrollRef.current.scrollLeft = Number(saved);
      sessionStorage.removeItem("kanbanScrollLeft");
    }
  }, []);

  // router.refresh() 後に initialColumns が更新されたら、ドラッグ中でなければ同期する
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!draggedItem) setColumns(normalize(initialColumns));
  }, [initialColumns]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    el.addEventListener("scroll", check, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", check);
    };
  }, [columns]);

  const {
    sensors,
    collisionDetectionStrategy,
    draggedItem,
    dragOverInfo,
    draggedCard,
    draggedColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop({ columns, setColumns, initialColumns });

  const {
    newColumnName,
    setNewColumnName,
    columnError,
    setColumnError,
    handleAddColumn,
    handleRenameColumn,
    handleDeleteColumn,
  } = useColumnActions({ columns });

  function refreshPreservingScroll() {
    if (scrollRef.current && scrollRef.current.scrollLeft > 0) {
      sessionStorage.setItem("kanbanScrollLeft", String(scrollRef.current.scrollLeft));
    }
    startTransition(() => router.refresh());
  }

  function openCardModal(cardId?: number, defaultColumnId?: number) {
    setModalState({ open: true, cardId, defaultColumnId });
  }

  function closeCardModal() {
    setModalState({ open: false });
  }

  const columnIds = columns.map((c) => `col-${c.id}`);

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">
          カンバンボード
        </h1>
      </div>

      <DndContext
        id="kanban-board"
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className={`kanban-board-wrapper flex-1${hasOverflow ? " has-overflow" : ""}`}>
          <div
            ref={scrollRef}
            className="kanban-columns flex h-full items-start gap-4 overflow-x-scroll pb-4"
          >
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  dragOverInfo={dragOverInfo}
                  onCardClick={(cardId) => openCardModal(cardId)}
                  onAddCard={(columnId) => openCardModal(undefined, columnId)}
                  onDeleteColumn={handleDeleteColumn}
                  onRenameColumn={handleRenameColumn}
                />
              ))}
            </SortableContext>

            <div className="flex w-64 shrink-0 flex-col gap-2 rounded-lg border border-dashed border-border p-3">
              <Input
                value={newColumnName}
                onChange={(e) => {
                  setNewColumnName(e.target.value);
                  setColumnError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleAddColumn();
                  }
                }}
                placeholder="新しい列名"
                aria-label="新しい列名"
              />
              {columnError && (
                <p className="text-xs text-error">{columnError}</p>
              )}
              <Button variant="secondary" onClick={handleAddColumn}>
                列を追加
              </Button>
            </div>
          </div>
        </div>

        <DragOverlay>
          {draggedCard ? (
            <KanbanCard card={draggedCard} onClick={() => {}} />
          ) : draggedColumn ? (
            <div className="w-72 rounded-lg border border-accent bg-background p-2 shadow-lg">
              {draggedColumn.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardModal
        open={modalState.open}
        onClose={closeCardModal}
        cardId={modalState.cardId}
        defaultColumnId={modalState.defaultColumnId}
        onSaved={refreshPreservingScroll}
      />
    </div>
  );
}

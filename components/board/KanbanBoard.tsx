"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { moveCard } from "@/actions/cards";
import {
  createColumn,
  deleteColumn,
  renameColumn,
  reorderColumns,
} from "@/actions/columns";
import { CardModal } from "@/components/card/CardModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CardWithLabels, Column } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";

const SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };

type BoardColumn = Column & { cards: CardWithLabels[] };

type DraggedItem =
  | { type: "column"; columnId: number }
  | { type: "card"; cardId: number; fromColumnId: number };

export type DragOverInfo = {
  cardId: number;
  targetColumnId: number;
  targetIndex: number;
} | null;

function normalize(cols: BoardColumn[]): BoardColumn[] {
  return cols.map((c) => ({
    ...c,
    cards: [...c.cards].sort((a, b) => a.position - b.position),
  }));
}

async function persistColumnPositions(
  columnId: number,
  cards: CardWithLabels[],
) {
  const tasks = cards
    .map((card, index) => ({ card, index }))
    .filter(
      ({ card, index }) =>
        card.columnId !== columnId || card.position !== index,
    )
    .map(({ card, index }) =>
      moveCard({ id: card.id, toColumnId: columnId, toPosition: index }),
    );
  await Promise.all(tasks);
}

export function KanbanBoard({
  initialColumns,
}: {
  initialColumns: BoardColumn[];
}) {
  const router = useRouter();
  const [columns, setColumns] = useState<BoardColumn[]>(() =>
    normalize(initialColumns),
  );
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo>(null);
  const [modalState, setModalState] = useState<{
    open: boolean;
    cardId?: number;
    defaultColumnId?: number;
  }>({ open: false });
  const [newColumnName, setNewColumnName] = useState("");
  const [columnError, setColumnError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [hasOverflow, setHasOverflow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const lastOverId = useRef<UniqueIdentifier | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, SENSOR_OPTIONS));

  const columnIds = columns.map((c) => `col-${c.id}`);

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const activeType = args.active.data.current?.type;

    if (activeType === "column") {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (c) => c.data.current?.type === "column",
        ),
      });
    }

    const pointerHits = pointerWithin(args);
    const intersections =
      pointerHits.length > 0 ? pointerHits : rectIntersection(args);

    let overId = getFirstCollision(intersections, "id");

    if (overId != null) {
      const overContainer = args.droppableContainers.find(
        (c) => c.id === overId,
      );
      if (overContainer?.data.current?.type === "column") {
        const columnId = overContainer.data.current.columnId as number;
        const cardsInColumn = args.droppableContainers.filter(
          (c) =>
            c.data.current?.type === "card" &&
            c.data.current?.columnId === columnId,
        );
        if (cardsInColumn.length > 0) {
          const activeColumnId = args.active.data.current?.columnId as
            | number
            | undefined;
          const isSameColumn = activeColumnId === columnId;

          if (isSameColumn) {
            // 同列内: closestCenter で並び替えターゲットを決定
            const closest = closestCenter({
              ...args,
              droppableContainers: cardsInColumn,
            });
            if (closest.length > 0) overId = closest[0].id;
          } else {
            // クロスカラム: ポインタが実際にカード内にある場合のみカードをターゲットにする。
            // ポインタが列の空白部分（最後のカードより下）にある場合は列をターゲットのまま維持し末尾挿入を許可する。
            const cardHits = pointerWithin({
              ...args,
              droppableContainers: cardsInColumn,
            });
            if (cardHits.length > 0) {
              const closest = closestCenter({
                ...args,
                droppableContainers: cardsInColumn,
              });
              if (closest.length > 0) overId = closest[0].id;
            }
          }
        }
      }

      lastOverId.current = overId;
      return [{ id: overId }];
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : [];
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "column") {
      setDraggedItem({ type: "column", columnId: data.columnId as number });
    } else if (data?.type === "card") {
      setDraggedItem({
        type: "card",
        cardId: data.cardId as number,
        fromColumnId: data.columnId as number,
      });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "card") {
      setDragOverInfo(null);
      return;
    }

    const fromColumnId = active.data.current.columnId as number;
    const overData = over.data.current;

    let targetColumnId: number | undefined;
    if (overData?.type === "column") {
      targetColumnId = overData.columnId as number;
    } else if (overData?.type === "card") {
      targetColumnId = overData.columnId as number;
    }

    if (targetColumnId === undefined || targetColumnId === fromColumnId) {
      setDragOverInfo(null);
      return;
    }

    const toCol = columns.find((c) => c.id === targetColumnId);
    if (!toCol) {
      setDragOverInfo(null);
      return;
    }

    let targetIndex = toCol.cards.length;
    if (overData?.type === "card") {
      const idx = toCol.cards.findIndex(
        (c) => c.id === (overData.cardId as number),
      );
      if (idx !== -1) targetIndex = idx;
    }

    lastOverId.current = over.id;
    setDragOverInfo({
      cardId: active.data.current.cardId as number,
      targetColumnId,
      targetIndex,
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    const dragged = draggedItem;
    setDraggedItem(null);
    setDragOverInfo(null);
    lastOverId.current = null;
    if (!over || !dragged) return;

    if (dragged.type === "column") {
      const overData = over.data.current;
      if (overData?.type !== "column") return;
      const overColumnId = overData.columnId as number;
      const oldIndex = columns.findIndex((c) => c.id === dragged.columnId);
      const newIndex = columns.findIndex((c) => c.id === overColumnId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(columns, oldIndex, newIndex);
      setColumns(reordered);
      reorderColumns({ orderedIds: reordered.map((c) => c.id) }).then(() => {
        startTransition(() => router.refresh());
      });
      return;
    }

    // カードドラッグ: ドロップ先を確定してから一度だけ setColumns する
    const { cardId, fromColumnId } = dragged;
    const overData = over.data.current;

    let toColumnId: number | undefined;
    if (overData?.type === "column") {
      toColumnId = overData.columnId as number;
    } else if (overData?.type === "card") {
      toColumnId = overData.columnId as number;
    }
    if (toColumnId === undefined) return;

    const fromCol = columns.find((c) => c.id === fromColumnId);
    if (!fromCol) return;

    if (fromColumnId === toColumnId) {
      // 同列内の並び替え
      const oldIndex = fromCol.cards.findIndex((c) => c.id === cardId);
      if (oldIndex === -1) return;

      let newIndex = oldIndex;
      if (overData?.type === "card") {
        const idx = fromCol.cards.findIndex(
          (c) => c.id === (overData.cardId as number),
        );
        if (idx !== -1) newIndex = idx;
      }

      if (oldIndex === newIndex) return;

      const reorderedCards = arrayMove(fromCol.cards, oldIndex, newIndex);
      const finalColumns = columns.map((c) =>
        c.id === fromColumnId ? { ...c, cards: reorderedCards } : c,
      );
      setColumns(finalColumns);

      const finalCol = finalColumns.find((c) => c.id === fromColumnId)!;
      persistColumnPositions(finalCol.id, finalCol.cards).then(() => {
        startTransition(() => router.refresh());
      });
    } else {
      // 列をまたぐ移動
      const toCol = columns.find((c) => c.id === toColumnId);
      if (!toCol) return;

      const movingCard = fromCol.cards.find((c) => c.id === cardId);
      if (!movingCard) return;

      let insertIndex = toCol.cards.length;
      if (overData?.type === "card") {
        const idx = toCol.cards.findIndex(
          (c) => c.id === (overData.cardId as number),
        );
        if (idx !== -1) insertIndex = idx;
      }

      const updatedCard = { ...movingCard, columnId: toColumnId };
      const finalColumns = columns.map((c) => {
        if (c.id === fromColumnId) {
          return { ...c, cards: c.cards.filter((card) => card.id !== cardId) };
        }
        if (c.id === toColumnId) {
          const next = [...c.cards];
          next.splice(insertIndex, 0, updatedCard);
          return { ...c, cards: next };
        }
        return c;
      });
      setColumns(finalColumns);

      const destColFinal = finalColumns.find((c) => c.id === toColumnId)!;
      const srcColFinal = finalColumns.find((c) => c.id === fromColumnId)!;
      const movedIdx = destColFinal.cards.findIndex((c) => c.id === cardId);

      // 移動したカードは columnId が変わるため、persistColumnPositions の
      // フィルタを通過しない可能性がある（columnId更新済みで position が一致する場合）。
      // 移動カードは明示的に moveCard し、その他はフィルタ任せにする。
      const destOtherTasks = destColFinal.cards
        .filter((c) => c.id !== cardId)
        .flatMap((card, localIdx) => {
          const actualIdx = localIdx < movedIdx ? localIdx : localIdx + 1;
          return card.position !== actualIdx
            ? [moveCard({ id: card.id, toColumnId, toPosition: actualIdx })]
            : [];
        });
      const srcTasks = srcColFinal.cards.flatMap((card, idx) =>
        card.position !== idx
          ? [
              moveCard({
                id: card.id,
                toColumnId: fromColumnId,
                toPosition: idx,
              }),
            ]
          : [],
      );
      Promise.all([
        moveCard({ id: cardId, toColumnId, toPosition: movedIdx }),
        ...destOtherTasks,
        ...srcTasks,
      ]).then(() => {
        startTransition(() => router.refresh());
      });
    }
  }

  function handleDragCancel() {
    setDraggedItem(null);
    setDragOverInfo(null);
    lastOverId.current = null;
    setColumns(normalize(initialColumns));
  }

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
    router.refresh();
  }

  async function handleRenameColumn(columnId: number, name: string) {
    await renameColumn({ id: columnId, name });
    router.refresh();
  }

  async function handleDeleteColumn(columnId: number) {
    const column = columns.find((c) => c.id === columnId);
    const confirmed = window.confirm(
      column
        ? `列「${column.name}」を削除しますか？所属するカードは「未整理」列へ移動します。`
        : "列を削除しますか？",
    );
    if (!confirmed) return;
    await deleteColumn({ id: columnId });
    router.refresh();
  }

  function openCardModal(cardId?: number, defaultColumnId?: number) {
    setModalState({ open: true, cardId, defaultColumnId });
  }

  function closeCardModal() {
    setModalState({ open: false });
  }

  const draggedCard =
    draggedItem?.type === "card"
      ? columns.flatMap((c) => c.cards).find((c) => c.id === draggedItem.cardId)
      : undefined;
  const draggedColumn =
    draggedItem?.type === "column"
      ? columns.find((c) => c.id === draggedItem.columnId)
      : undefined;

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
        <div
          className={`kanban-board-wrapper flex-1${hasOverflow ? " has-overflow" : ""}`}
        >
          <div
            ref={scrollRef}
            className="kanban-columns flex h-full items-start gap-4 overflow-x-scroll pb-4"
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
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
        onSaved={() => router.refresh()}
      />
    </div>
  );
}

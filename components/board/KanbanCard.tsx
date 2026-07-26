"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { LabelChip } from "@/components/ui/LabelChip";
import type { CardWithLabels } from "@/lib/types";

/**
 * カンバンボード上の1枚のカード。
 * @dnd-kit/sortable の useSortable でドラッグ可能にし、
 * クリックでカード詳細/編集モーダルを開く（onClick）。
 */
export function KanbanCard({
  card,
  onClick,
}: {
  card: CardWithLabels;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
    data: { type: "card", cardId: card.id, columnId: card.columnId },
  });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition: transition ?? undefined,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: card.color ?? "var(--color-border)",
        backgroundColor: card.color ? `${card.color}28` : undefined,
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="flex cursor-pointer flex-col gap-2 rounded border border-border border-l-4 bg-surface p-3 text-left shadow-sm transition-shadow hover:shadow"
    >
      <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>

      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <LabelChip key={label.id} name={label.name} />
          ))}
        </div>
      )}

      {(card.deadline || card.targetDate || card.personMonth != null) && (
        <div className="flex items-center gap-3 text-xs text-subtext">
          {card.targetDate && <span>目標: {card.targetDate}</span>}
          {card.deadline && <span>納期: {card.deadline}</span>}
          {card.personMonth != null && (
            <span>{Math.round(card.personMonth)}人月</span>
          )}
        </div>
      )}
    </div>
  );
}

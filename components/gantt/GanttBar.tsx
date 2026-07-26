"use client";

import type { Card } from "@/lib/types";
import { diffInDays, parseISODateToUTC } from "./date-utils";

const DEFAULT_BAR_COLOR = "var(--color-accent)";

/**
 * ガントチャートの1カード分の期間バー。
 * rangeStartUTC を基準に、開始日〜納期の位置と幅をdayWidth(px)換算で算出する。
 * クリックすると onClick 経由で CardModal を開く（親コンポーネントが状態を保持する）。
 */
export function GanttBar({
  card,
  rangeStartUTC,
  dayWidth,
  onClick,
}: {
  card: Card;
  rangeStartUTC: number;
  dayWidth: number;
  onClick: (cardId: number) => void;
}) {
  // getGanttData() は startDate/deadline 両方がある Card のみを返すため non-null と扱える
  const startUTC = parseISODateToUTC(card.startDate as string);
  const deadlineUTC = parseISODateToUTC(card.deadline as string);

  const offsetDays = diffInDays(rangeStartUTC, startUTC);
  const durationDays = diffInDays(startUTC, deadlineUTC) + 1;

  return (
    <button
      type="button"
      onClick={() => onClick(card.id)}
      title={card.title}
      className="absolute top-1 flex h-8 items-center overflow-hidden rounded px-2 text-left text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      style={{
        left: offsetDays * dayWidth,
        width: Math.max(durationDays * dayWidth - 4, dayWidth - 4),
        backgroundColor: card.color ?? DEFAULT_BAR_COLOR,
      }}
    >
      <span className="truncate">{card.title}</span>
    </button>
  );
}

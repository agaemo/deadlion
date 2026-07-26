"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CardModal } from "@/components/card/CardModal";
import type { Card } from "@/lib/types";
import {
  addDaysUTC,
  diffInDays,
  formatMonthDay,
  isMonthStart,
  parseISODateToUTC,
} from "./date-utils";
import { GanttBar } from "./GanttBar";

const DAY_WIDTH = 32;
const ROW_HEIGHT = 40;

/**
 * ガントチャート画面。ganttService.getGanttData() が返す
 * 「開始日・納期が両方設定されたカード」のみを受け取り、日付軸とバーを描画する。
 * バーをクリックすると CardModal を開く。
 */
export function GanttChart({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [selectedCardId, setSelectedCardId] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  const sortedCards = useMemo(
    () =>
      [...cards].sort(
        (a, b) =>
          parseISODateToUTC(a.startDate as string) - parseISODateToUTC(b.startDate as string),
      ),
    [cards],
  );

  const range = useMemo(() => {
    if (sortedCards.length === 0) return null;

    let minStart = parseISODateToUTC(sortedCards[0].startDate as string);
    let maxDeadline = minStart;

    for (const card of sortedCards) {
      const startUTC = parseISODateToUTC(card.startDate as string);
      const deadlineUTC = parseISODateToUTC(card.deadline as string);
      if (startUTC < minStart) minStart = startUTC;
      if (deadlineUTC > maxDeadline) maxDeadline = deadlineUTC;
    }

    const totalDays = diffInDays(minStart, maxDeadline) + 1;
    const days = Array.from({ length: totalDays }, (_, i) => addDaysUTC(minStart, i));

    return { minStart, totalDays, days };
  }, [sortedCards]);

  function openCard(cardId: number) {
    setSelectedCardId(cardId);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedCardId(undefined);
  }

  function handleSaved() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="font-heading text-xl font-bold text-foreground">ガントチャート</h1>

      {!range ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border bg-surface py-16">
          <p className="text-subtext">
            開始日と納期の両方が設定されたカードがまだありません
          </p>
        </div>
      ) : (
        <div className="flex overflow-hidden rounded border border-border bg-surface">
          {/* カードタイトル列（固定幅） */}
          <div className="w-48 flex-shrink-0 border-r border-border">
            <div
              className="border-b border-border bg-surface"
              style={{ height: ROW_HEIGHT }}
            />
            {sortedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center truncate border-b border-border px-3 text-sm text-foreground"
                style={{ height: ROW_HEIGHT }}
                title={card.title}
              >
                {card.title}
              </div>
            ))}
          </div>

          {/* 日付軸 + バー（横スクロール） */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ width: range.totalDays * DAY_WIDTH }}>
              <div
                className="grid border-b border-border"
                style={{
                  gridTemplateColumns: `repeat(${range.totalDays}, ${DAY_WIDTH}px)`,
                  height: ROW_HEIGHT,
                }}
              >
                {range.days.map((dayUTC) => (
                  <div
                    key={dayUTC}
                    className={`flex items-center justify-center border-r text-xs text-subtext ${
                      isMonthStart(dayUTC) ? "border-r-foreground/30" : "border-border"
                    }`}
                  >
                    {formatMonthDay(dayUTC)}
                  </div>
                ))}
              </div>

              {sortedCards.map((card) => (
                <div
                  key={card.id}
                  className="relative border-b border-border"
                  style={{ height: ROW_HEIGHT }}
                >
                  <GanttBar
                    card={card}
                    rangeStartUTC={range.minStart}
                    dayWidth={DAY_WIDTH}
                    onClick={openCard}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CardModal
        open={modalOpen}
        onClose={closeModal}
        cardId={selectedCardId}
        onSaved={handleSaved}
      />
    </div>
  );
}

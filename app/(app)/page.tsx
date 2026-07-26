export const dynamic = "force-dynamic";

import { KanbanBoard } from "@/components/board/KanbanBoard";
import { boardService } from "@/lib/services/registry";

export default function BoardPage() {
  const columns = boardService.getBoard();
  // 内容が実際に変わったときだけ KanbanBoard を再マウントする。
  // props参照の変化だけでは同期しない設計（KanbanBoard側のコメント参照）にしたため、
  // router.refresh() 後にサーバー側の最新データを確実に反映させるには key が必要。
  const version = columns
    .map(
      (c) =>
        `${c.id}:${c.position}:${c.cards
          .map((card) => `${card.id}.${card.position}.${card.columnId}`)
          .join(",")}`,
    )
    .join("|");

  return <KanbanBoard key={version} initialColumns={columns} />;
}

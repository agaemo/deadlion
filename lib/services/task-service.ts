import type { CardRepository } from "../db/repositories/interfaces/card-repository";
import type { CommentRepository } from "../db/repositories/interfaces/comment-repository";
import type { LabelRepository } from "../db/repositories/interfaces/label-repository";
import type { CardWithLabels } from "@/lib/types";

type SortKey =
  | "title"
  | "column"
  | "createdAt"
  | "deadline"
  | "targetDate"
  | "startDate";

type GetTasksParams = {
  sort?: SortKey;
  order?: "asc" | "desc";
  query?: string;
};

type Deps = {
  cardRepo: CardRepository;
  labelRepo: LabelRepository;
  commentRepo: CommentRepository;
};

function sortValue(card: CardWithLabels, sort: SortKey): string | number | null {
  switch (sort) {
    case "title":
      return card.title;
    case "column":
      return card.columnId;
    case "createdAt":
      return card.createdAt;
    case "deadline":
      return card.deadline;
    case "targetDate":
      return card.targetDate;
    case "startDate":
      return card.startDate;
  }
}

export function createTaskService(deps: Deps) {
  function getTasks(params: GetTasksParams): CardWithLabels[] {
    let cards: CardWithLabels[] = deps.cardRepo.findAll().map((card) => ({
      ...card,
      labels: deps.labelRepo.findByCardId(card.id),
    }));

    const query = params.query?.trim().toLowerCase();
    if (query) {
      cards = cards.filter((card) => {
        if (card.title.toLowerCase().includes(query)) return true;
        if (card.description?.toLowerCase().includes(query)) return true;
        if (card.labels.some((label) => label.name.toLowerCase().includes(query))) {
          return true;
        }
        const comments = deps.commentRepo.findByCardId(card.id);
        return comments.some((comment) => comment.body.toLowerCase().includes(query));
      });
    }

    if (params.sort) {
      const sort = params.sort;
      const order = params.order === "desc" ? -1 : 1;
      cards = [...cards].sort((a, b) => {
        const av = sortValue(a, sort);
        const bv = sortValue(b, sort);
        if (av === bv) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return order * (av < bv ? -1 : 1);
      });
    }

    return cards;
  }

  return { getTasks };
}

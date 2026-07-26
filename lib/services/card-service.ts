import type { CardRepository } from "../db/repositories/interfaces/card-repository";
import type { CommentRepository } from "../db/repositories/interfaces/comment-repository";
import type { LabelRepository } from "../db/repositories/interfaces/label-repository";
import type { CardWithLabels, CreateCardInput, UpdateCardInput } from "@/lib/types";

type Deps = {
  cardRepo: CardRepository;
  labelRepo: LabelRepository;
  commentRepo: CommentRepository;
};

export function createCardService(deps: Deps) {
  function getCard(id: number) {
    const card = deps.cardRepo.findById(id);
    if (!card) return undefined;

    return {
      ...card,
      labels: deps.labelRepo.findByCardId(id),
      comments: deps.commentRepo.findByCardId(id),
    };
  }

  function createCard(input: CreateCardInput): CardWithLabels {
    const created = deps.cardRepo.create(input);
    if (input.labelNames) {
      deps.labelRepo.setLabelsForCard(created.id, input.labelNames);
    }
    return { ...created, labels: deps.labelRepo.findByCardId(created.id) };
  }

  function updateCard(id: number, input: UpdateCardInput): CardWithLabels | undefined {
    const updated = deps.cardRepo.update(id, input);
    if (!updated) return undefined;
    if (input.labelNames) {
      deps.labelRepo.setLabelsForCard(id, input.labelNames);
    }
    return { ...updated, labels: deps.labelRepo.findByCardId(id) };
  }

  function deleteCard(id: number) {
    deps.cardRepo.delete(id);
  }

  function moveCard(id: number, toColumnId: number, toPosition: number) {
    deps.cardRepo.updateColumnAndPosition(id, toColumnId, toPosition);
  }

  return { getCard, createCard, updateCard, deleteCard, moveCard };
}

import type { CardRepository } from "../db/repositories/interfaces/card-repository";
import type { Card } from "@/lib/types";

type Deps = {
  cardRepo: CardRepository;
};

export function createGanttService(deps: Deps) {
  function getGanttData(): Card[] {
    return deps.cardRepo.findAll().filter((card) => card.startDate && card.deadline);
  }

  return { getGanttData };
}

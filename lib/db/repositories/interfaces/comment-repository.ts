import type { Comment } from "@/lib/types";

export interface CommentRepository {
  findByCardId(cardId: number): Comment[];
  create(cardId: number, body: string): Comment;
  update(id: number, body: string): Comment | undefined;
  delete(id: number): void;
}

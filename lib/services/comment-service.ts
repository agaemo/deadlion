import type { CommentRepository } from "../db/repositories/interfaces/comment-repository";

type Deps = {
  commentRepo: CommentRepository;
};

export function createCommentService(deps: Deps) {
  return {
    addComment(cardId: number, body: string) {
      return deps.commentRepo.create(cardId, body);
    },
    updateComment(id: number, body: string) {
      return deps.commentRepo.update(id, body);
    },
    deleteComment(id: number) {
      deps.commentRepo.delete(id);
    },
  };
}

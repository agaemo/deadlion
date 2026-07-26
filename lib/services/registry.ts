import { db } from "@/lib/db";
import { createCardRepository } from "@/lib/db/repositories/drizzle/card-repository";
import { createColumnRepository } from "@/lib/db/repositories/drizzle/column-repository";
import { createCommentRepository } from "@/lib/db/repositories/drizzle/comment-repository";
import { createLabelRepository } from "@/lib/db/repositories/drizzle/label-repository";
import { createBoardService } from "./board-service";
import { createCardService } from "./card-service";
import { createColumnService } from "./column-service";
import { createCommentService } from "./comment-service";
import { createGanttService } from "./gantt-service";
import { createTaskService } from "./task-service";
import { createUserRepository } from "@/lib/db/repositories/drizzle/user-repository";
import { createUserService } from "./user-service";

const cardRepo = createCardRepository(db);
const columnRepo = createColumnRepository(db);
const labelRepo = createLabelRepository(db);
const commentRepo = createCommentRepository(db);
const userRepo = createUserRepository(db);

export const cardService = createCardService({
  cardRepo,
  labelRepo,
  commentRepo,
});
export const commentService = createCommentService({ commentRepo });
export const boardService = createBoardService({
  columnRepo,
  cardRepo,
  labelRepo,
});
export const columnService = createColumnService({ columnRepo, cardRepo });
export const taskService = createTaskService({
  cardRepo,
  labelRepo,
  commentRepo,
});
export const ganttService = createGanttService({ cardRepo });
export const userService = createUserService({ userRepo });

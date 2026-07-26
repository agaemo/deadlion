import { z } from "zod";

export const commentBodySchema = z.string().min(1, "コメントを入力してください");

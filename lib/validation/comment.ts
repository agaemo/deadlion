import { z } from "zod";

export const commentBodySchema = z.string().min(1, "コメントを入力してください").max(2000, "コメントは2000文字以内で入力してください");

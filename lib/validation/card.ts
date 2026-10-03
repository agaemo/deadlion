import { z } from "zod";

export const createCardSchema = z.object({
  columnId: z.number().int().positive(),
  title: z.string().min(1, "タイトルを入力してください").max(200, "タイトルは200文字以内で入力してください"),
  description: z.string().max(5000, "説明は5000文字以内で入力してください").optional(),
  deadline: z.string().optional(),
  targetDate: z.string().optional(),
  personMonth: z.number().optional(),
  startDate: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "カラーコードが不正です").nullable().optional(),
  labelNames: z.array(z.string()).optional(),
});

export const updateCardSchema = createCardSchema.omit({ columnId: true }).partial();

export const moveCardSchema = z.object({
  id: z.number().int().positive(),
  toColumnId: z.number().int().positive(),
  toPosition: z.number().int().min(0),
});

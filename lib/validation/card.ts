import { z } from "zod";

export const createCardSchema = z.object({
  columnId: z.number().int().positive(),
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  targetDate: z.string().optional(),
  personMonth: z.number().optional(),
  startDate: z.string().optional(),
  color: z.string().optional(),
  labelNames: z.array(z.string()).optional(),
});

export const updateCardSchema = createCardSchema.omit({ columnId: true }).partial();

export const moveCardSchema = z.object({
  id: z.number().int().positive(),
  toColumnId: z.number().int().positive(),
  toPosition: z.number().int().min(0),
});

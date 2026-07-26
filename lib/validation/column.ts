import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(1, "列名を入力してください"),
});

export const deleteColumnSchema = z.object({
  id: z.number().int().positive(),
});

export const renameColumnSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "列名を入力してください"),
});

export const reorderColumnsSchema = z.object({
  orderedIds: z.array(z.number().int().positive()).min(1),
});

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { columnService } from "@/lib/services/registry";
import type { Column, Result } from "@/lib/types";
import {
  createColumnSchema,
  deleteColumnSchema,
  renameColumnSchema,
  reorderColumnsSchema,
} from "@/lib/validation/column";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/gantt");
}

export async function createColumn(input: unknown): Promise<Result<Column>> {
  await requireAuth();
  const parsed = createColumnSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  const column = columnService.createColumn(parsed.data.name);
  revalidateAll();
  return { ok: true, data: column };
}

export async function renameColumn(input: unknown): Promise<Result<Column>> {
  await requireAuth();
  const parsed = renameColumnSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  const column = columnService.renameColumn(parsed.data.id, parsed.data.name);
  revalidateAll();
  return { ok: true, data: column };
}

export async function deleteColumn(input: unknown): Promise<Result<null>> {
  await requireAuth();
  const parsed = deleteColumnSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  columnService.deleteColumn(parsed.data.id);
  revalidateAll();
  return { ok: true, data: null };
}

export async function reorderColumns(input: unknown): Promise<Result<null>> {
  await requireAuth();
  const parsed = reorderColumnsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  columnService.reorderColumns(parsed.data.orderedIds);
  revalidateAll();
  return { ok: true, data: null };
}

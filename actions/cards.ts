"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { cardService } from "@/lib/services/registry";
import type { CardWithLabels, Comment, Result } from "@/lib/types";
import { createCardSchema, moveCardSchema, updateCardSchema } from "@/lib/validation/card";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/gantt");
}

export async function createCard(input: unknown): Promise<Result<CardWithLabels>> {
  await requireAuth();
  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  const card = cardService.createCard(parsed.data);
  revalidateAll();
  return { ok: true, data: card };
}

export async function updateCard(
  id: number,
  input: unknown,
): Promise<Result<CardWithLabels>> {
  await requireAuth();
  const parsed = updateCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  const card = cardService.updateCard(id, parsed.data);
  if (!card) {
    return { ok: false, error: "カードが見つかりません" };
  }

  revalidateAll();
  return { ok: true, data: card };
}

export async function deleteCard(id: number): Promise<Result<null>> {
  await requireAuth();
  cardService.deleteCard(id);
  revalidateAll();
  return { ok: true, data: null };
}

export async function moveCard(input: unknown): Promise<Result<null>> {
  await requireAuth();
  const parsed = moveCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  cardService.moveCard(parsed.data.id, parsed.data.toColumnId, parsed.data.toPosition);
  revalidateAll();
  return { ok: true, data: null };
}

export async function getCardDetail(
  id: number,
): Promise<Result<CardWithLabels & { comments: Comment[] }>> {
  await requireAuth();
  const card = cardService.getCard(id);
  if (!card) {
    return { ok: false, error: "カードが見つかりません" };
  }
  return { ok: true, data: card };
}

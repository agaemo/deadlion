"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { commentService } from "@/lib/services/registry";
import type { Comment, Result } from "@/lib/types";
import { commentBodySchema } from "@/lib/validation/comment";

export async function addComment(
  cardId: number,
  body: unknown,
): Promise<Result<Comment>> {
  await requireAuth();
  const parsed = commentBodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  const comment = commentService.addComment(cardId, parsed.data);
  revalidatePath("/");
  return { ok: true, data: comment };
}

export async function updateComment(
  id: number,
  body: unknown,
): Promise<Result<Comment>> {
  await requireAuth();
  const parsed = commentBodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が不正です" };
  }

  const comment = commentService.updateComment(id, parsed.data);
  if (!comment) {
    return { ok: false, error: "コメントが見つかりません" };
  }

  revalidatePath("/");
  return { ok: true, data: comment };
}

export async function deleteComment(id: number): Promise<Result<null>> {
  await requireAuth();
  commentService.deleteComment(id);
  revalidatePath("/");
  return { ok: true, data: null };
}

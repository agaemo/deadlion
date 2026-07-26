"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { userService } from "@/lib/services/registry";
import type { Result } from "@/lib/types";
import { changePasswordSchema } from "@/lib/validation/user";

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<Result<void>> {
  const session = await requireAuth();
  const parsed = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "入力内容が不正です",
    };
  }
  const userId = Number(session.user.id);
  return userService.changePassword(
    userId,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { userService } from "@/lib/services/registry";
import type { Result, User } from "@/lib/types";
import { createUserSchema, deleteUserSchema } from "@/lib/validation/user";

export async function listUsers(): Promise<User[]> {
  await requireAdmin();
  return userService.listUsers();
}

export async function createUser(
  username: string,
  password: string,
): Promise<Result<User>> {
  await requireAdmin();
  const parsed = createUserSchema.safeParse({ username, password });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "入力内容が不正です",
    };
  }
  const result = userService.createUser(
    parsed.data.username,
    parsed.data.password,
  );
  if (result.ok) {
    revalidatePath("/admin/users");
  }
  return result;
}

export async function deleteUser(id: number): Promise<Result<void>> {
  const session = await requireAdmin();
  const parsed = deleteUserSchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false, error: "不正なユーザーIDです" };
  }
  const requesterId = Number(session.user.id);
  const result = userService.deleteUser(parsed.data.id, requesterId);
  if (result.ok) {
    revalidatePath("/admin/users");
  }
  return result;
}

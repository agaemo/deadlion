"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import type { Result } from "@/lib/types";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function login(
  username: string,
  password: string,
): Promise<Result<null>> {
  const parsed = loginSchema.safeParse({ username, password });
  if (!parsed.success) {
    return { ok: false, error: "ユーザー名とパスワードを入力してください" };
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "ユーザー名またはパスワードが正しくありません" };
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

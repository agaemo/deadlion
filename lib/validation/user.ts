import { z } from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "ユーザー名を入力してください")
    .max(64, "ユーザー名は64文字以内で入力してください")
    .regex(/^[a-zA-Z0-9_-]+$/, "ユーザー名は英数字・_・- のみ使用できます"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export const deleteUserSchema = z.object({
  id: z.number().int().positive(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    newPassword: z
      .string()
      .min(8, "新しいパスワードは8文字以上で入力してください"),
    confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "新しいパスワードが一致しません",
    path: ["confirmPassword"],
  });

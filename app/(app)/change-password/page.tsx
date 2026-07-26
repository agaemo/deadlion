"use client";

import { useRef, useState, useTransition } from "react";
import { logout } from "@/actions/auth";
import { updatePassword } from "@/actions/change-password";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

export default function ChangePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    startTransition(async () => {
      const result = await updatePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );
      if (result.ok) {
        await logout();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-lg border border-border bg-surface p-8 shadow-sm"
      >
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">
            パスワードの変更
          </h1>
          <p className="mt-1 text-sm text-subtext">
            初回ログインのため、パスワードを変更してください
          </p>
        </div>

        <FormField label="現在のパスワード" htmlFor="currentPassword">
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </FormField>

        <FormField label="新しいパスワード" htmlFor="newPassword">
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </FormField>

        <FormField label="新しいパスワード（確認）" htmlFor="confirmPassword">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </FormField>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "変更中..." : "パスワードを変更する"}
        </Button>
      </form>
    </div>
  );
}

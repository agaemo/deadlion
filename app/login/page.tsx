"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import type { Result } from "@/lib/types";

async function loginAction(
  _prevState: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  return login(username, password);
}

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-5 rounded-lg border border-border bg-surface p-8 shadow-sm"
      >
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Logo size={48} />
            <h1 className="font-heading text-2xl font-bold text-accent-strong">
              deadlion
            </h1>
          </div>
          <p className="mt-1 text-sm text-subtext">ログインしてください</p>
        </div>

        <FormField label="ユーザー名" htmlFor="username">
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
          />
        </FormField>

        <FormField label="パスワード" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </FormField>

        {state && !state.ok && (
          <p className="text-sm text-error">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
    </div>
  );
}

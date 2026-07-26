"use client";

import { useRef, useState, useTransition } from "react";
import { createUser, deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import type { Result, User } from "@/lib/types";

export function AdminUsersClient({ users: initialUsers }: { users: User[] }) {
  const [createState, setCreateState] = useState<Result<User> | null>(null);
  const [isCreating, startCreate] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("new-username") ?? "");
    const password = String(formData.get("new-password") ?? "");
    startCreate(async () => {
      const result = await createUser(username, password);
      setCreateState(result);
      if (result.ok) {
        formRef.current?.reset();
      }
    });
  }

  function handleDelete(id: number, username: string) {
    if (!confirm(`「${username}」を削除しますか？`)) return;
    startDelete(async () => {
      const result = await deleteUser(id);
      if (!result.ok) {
        alert(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <h1 className="text-xl font-bold text-foreground">ユーザー管理</h1>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          ユーザー追加
        </h2>
        <form ref={formRef} onSubmit={handleCreate} className="space-y-4">
          <FormField
            label="ユーザー名"
            htmlFor="new-username"
            error={
              createState && !createState.ok ? createState.error : undefined
            }
          >
            <Input
              id="new-username"
              name="new-username"
              type="text"
              autoComplete="off"
              required
            />
          </FormField>
          <FormField label="初期パスワード" htmlFor="new-password">
            <Input
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              required
            />
          </FormField>
          {createState?.ok && (
            <p className="text-sm text-accent-strong">
              ユーザー「{createState.data.username}」を追加しました
            </p>
          )}
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "追加中..." : "追加"}
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          ユーザー一覧
        </h2>
        {initialUsers.length === 0 ? (
          <p className="text-sm text-subtext">ユーザーが存在しません</p>
        ) : (
          <ul className="divide-y divide-border">
            {initialUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {user.username}
                  </span>
                  {user.isAdmin === 1 && (
                    <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-white">
                      管理者
                    </span>
                  )}
                  {user.mustChangePassword === 1 && (
                    <span className="rounded bg-primary-100/60 px-1.5 py-0.5 text-xs text-subtext">
                      初回ログイン
                    </span>
                  )}
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(user.id, user.username)}
                  disabled={isDeleting}
                >
                  削除
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

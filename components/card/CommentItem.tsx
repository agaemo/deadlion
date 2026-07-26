"use client";

import { useState } from "react";
import { deleteComment, updateComment } from "@/actions/comments";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import type { Comment } from "@/lib/types";

export function CommentItem({
  comment,
  onChanged,
}: {
  comment: Comment;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [pending, setPending] = useState(false);

  async function handleUpdate() {
    setPending(true);
    const result = await updateComment(comment.id, body);
    setPending(false);
    if (result.ok) {
      setEditing(false);
      onChanged();
    }
  }

  async function handleDelete() {
    setPending(true);
    await deleteComment(comment.id);
    setPending(false);
    onChanged();
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded border border-border bg-surface p-3">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleUpdate} disabled={pending}>
            保存
          </Button>
          <Button variant="ghost" onClick={() => setEditing(false)} disabled={pending}>
            キャンセル
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded border border-border bg-surface p-3">
      <p className="whitespace-pre-wrap text-sm text-foreground">{comment.body}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-subtext">
          {new Date(comment.createdAt).toLocaleString("ja-JP")}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-xs text-subtext hover:text-accent"
            onClick={() => setEditing(true)}
          >
            編集
          </button>
          <button
            type="button"
            className="text-xs text-subtext hover:text-error"
            onClick={handleDelete}
            disabled={pending}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

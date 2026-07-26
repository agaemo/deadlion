"use client";

import { useState } from "react";
import { addComment } from "@/actions/comments";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import type { Comment } from "@/lib/types";
import { CommentItem } from "./CommentItem";

export function CommentThread({
  cardId,
  comments,
  onChanged,
}: {
  cardId: number;
  comments: Comment[];
  onChanged: () => void;
}) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await addComment(cardId, body);
    setPending(false);
    if (result.ok) {
      setBody("");
      onChanged();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <h3 className="text-sm font-semibold text-foreground">コメント</h3>
      <div className="flex flex-col gap-2">
        {comments.length === 0 && (
          <p className="text-sm text-subtext">コメントはまだありません</p>
        )}
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} onChanged={onChanged} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力"
          rows={2}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button
          type="button"
          variant="secondary"
          onClick={handleSubmit}
          disabled={pending || !body.trim()}
        >
          コメントを追加
        </Button>
      </div>
    </div>
  );
}

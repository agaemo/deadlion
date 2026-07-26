"use client";

import { useEffect, useState } from "react";
import { createCard, deleteCard, getCardDetail, updateCard } from "@/actions/cards";
import { Button } from "@/components/ui/Button";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { LabelChip } from "@/components/ui/LabelChip";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import type { Comment } from "@/lib/types";
import { CommentThread } from "./CommentThread";

type CardFormState = {
  title: string;
  description: string;
  deadline: string;
  targetDate: string;
  personMonth: string;
  startDate: string;
  color: string | null;
  labelNames: string[];
};

const EMPTY_FORM: CardFormState = {
  title: "",
  description: "",
  deadline: "",
  targetDate: "",
  personMonth: "",
  startDate: "",
  color: null,
  labelNames: [],
};

export function CardModal({
  open,
  onClose,
  cardId,
  defaultColumnId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  cardId?: number;
  defaultColumnId?: number;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CardFormState>(EMPTY_FORM);
  const [comments, setComments] = useState<Comment[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!cardId) {
      setForm(EMPTY_FORM);
      setComments([]);
      setError(null);
      return;
    }

    setLoading(true);
    getCardDetail(cardId).then((result) => {
      setLoading(false);
      if (result.ok) {
        const card = result.data;
        setForm({
          title: card.title,
          description: card.description ?? "",
          deadline: card.deadline ?? "",
          targetDate: card.targetDate ?? "",
          personMonth: card.personMonth != null ? String(card.personMonth) : "",
          startDate: card.startDate ?? "",
          color: card.color,
          labelNames: card.labels.map((label) => label.name),
        });
        setComments(card.comments);
      }
    });
  }, [open, cardId]);

  function refreshComments() {
    if (!cardId) return;
    getCardDetail(cardId).then((result) => {
      if (result.ok) setComments(result.data.comments);
    });
  }

  async function handleSave() {
    setPending(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description || undefined,
      deadline: form.deadline || undefined,
      targetDate: form.targetDate || undefined,
      personMonth: form.personMonth ? Number(form.personMonth) : undefined,
      startDate: form.startDate || undefined,
      color: form.color ?? undefined,
      labelNames: form.labelNames,
    };

    const result = cardId
      ? await updateCard(cardId, payload)
      : await createCard({ ...payload, columnId: defaultColumnId });

    setPending(false);

    if (result.ok) {
      onSaved();
      onClose();
    } else {
      setError(result.error);
    }
  }

  async function handleDelete() {
    if (!cardId) return;
    setPending(true);
    await deleteCard(cardId);
    setPending(false);
    onSaved();
    onClose();
  }

  function addLabel() {
    const name = labelInput.trim();
    if (!name || form.labelNames.includes(name)) return;
    setForm((f) => ({ ...f, labelNames: [...f.labelNames, name] }));
    setLabelInput("");
  }

  function removeLabel(name: string) {
    setForm((f) => ({
      ...f,
      labelNames: f.labelNames.filter((n) => n !== name),
    }));
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {cardId ? "カードを編集" : "カードを作成"}
          </h2>

          <FormField label="タイトル" htmlFor="card-title">
            <Input
              id="card-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="説明文" htmlFor="card-description">
            <Textarea
              id="card-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="開始日" htmlFor="card-start-date">
              <Input
                id="card-start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </FormField>
            <FormField label="納期" htmlFor="card-deadline">
              <Input
                id="card-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </FormField>
            <FormField label="目標期日" htmlFor="card-target-date">
              <Input
                id="card-target-date"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
              />
            </FormField>
            <FormField label="人月" htmlFor="card-person-month">
              <Input
                id="card-person-month"
                type="number"
                step="0.1"
                value={form.personMonth}
                onChange={(e) => setForm((f) => ({ ...f, personMonth: e.target.value }))}
              />
            </FormField>
          </div>

          <FormField label="ラベル" htmlFor="card-label-input">
            <div className="flex flex-wrap items-center gap-2">
              {form.labelNames.map((name) => (
                <LabelChip key={name} name={name} onRemove={() => removeLabel(name)} />
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                id="card-label-input"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLabel();
                  }
                }}
                placeholder="ラベル名を入力してEnter"
              />
              <Button type="button" variant="secondary" onClick={addLabel}>
                追加
              </Button>
            </div>
          </FormField>

          <FormField label="カード色" htmlFor="card-color">
            <ColorSwatch
              value={form.color}
              onChange={(color) => setForm((f) => ({ ...f, color }))}
            />
          </FormField>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              {cardId && (
                <Button variant="danger" onClick={handleDelete} disabled={pending}>
                  削除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} disabled={pending}>
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={pending || !form.title.trim()}
              >
                保存
              </Button>
            </div>
          </div>

          {cardId && (
            <CommentThread cardId={cardId} comments={comments} onChanged={refreshComments} />
          )}
        </div>
      )}
    </Modal>
  );
}

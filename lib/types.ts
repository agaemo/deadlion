import type { InferSelectModel } from "drizzle-orm";
import type { cards, columns, comments, labels, users } from "./db/schema";

export type Column = InferSelectModel<typeof columns>;
export type Card = InferSelectModel<typeof cards>;
export type Label = InferSelectModel<typeof labels>;
export type Comment = InferSelectModel<typeof comments>;
export type User = InferSelectModel<typeof users>;

export type CardWithLabels = Card & { labels: Label[] };

export type CreateCardInput = {
  columnId: number;
  title: string;
  description?: string | null;
  deadline?: string | null;
  targetDate?: string | null;
  personMonth?: number | null;
  startDate?: string | null;
  color?: string | null;
  labelNames?: string[];
};

export type UpdateCardInput = Partial<Omit<CreateCardInput, "columnId">>;

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

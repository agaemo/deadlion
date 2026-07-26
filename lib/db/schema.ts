import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: integer("is_admin").notNull().default(0),
  mustChangePassword: integer("must_change_password").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const columns = sqliteTable("columns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  createdAt: text("created_at").notNull(),
});

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  columnId: integer("column_id")
    .notNull()
    .references(() => columns.id),
  title: text("title").notNull(),
  description: text("description"),
  deadline: text("deadline"),
  targetDate: text("target_date"),
  personMonth: real("person_month"),
  startDate: text("start_date"),
  color: text("color"),
  position: integer("position").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const labels = sqliteTable("labels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const cardLabels = sqliteTable(
  "card_labels",
  {
    cardId: integer("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id),
  },
  (table) => [primaryKey({ columns: [table.cardId, table.labelId] })],
);

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

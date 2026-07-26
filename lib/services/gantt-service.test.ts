import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "../db/index";
import { runMigrations } from "../db/migrate";
import { createCardRepository } from "../db/repositories/drizzle/card-repository";
import { createColumnRepository } from "../db/repositories/drizzle/column-repository";
import { cleanupTmpDbFile, createTmpDbPath } from "../db/test-utils";
import { createGanttService } from "./gantt-service";

describe("createGanttService", () => {
  const tmpPaths: string[] = [];

  afterEach(() => {
    for (const path of tmpPaths.splice(0)) {
      cleanupTmpDbFile(path);
    }
  });

  function setupDb() {
    const path = createTmpDbPath();
    tmpPaths.push(path);
    const db = createDb(path);
    runMigrations(db);
    return db;
  }

  function setupService(db: ReturnType<typeof createDb>) {
    const cardRepo = createCardRepository(db);
    const columnRepo = createColumnRepository(db);
    const service = createGanttService({ cardRepo });
    return { service, cardRepo, columnRepo };
  }

  it("startDateとdeadlineの両方があるカードのみ返る", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    const target = cardRepo.create({
      columnId: column.id,
      title: "対象",
      startDate: "2026-01-01",
      deadline: "2026-02-01",
    });
    cardRepo.create({
      columnId: column.id,
      title: "startDateのみ",
      startDate: "2026-01-01",
    });
    cardRepo.create({
      columnId: column.id,
      title: "deadlineのみ",
      deadline: "2026-02-01",
    });
    cardRepo.create({ columnId: column.id, title: "どちらもなし" });

    const result = service.getGanttData();

    expect(result.map((c) => c.id)).toEqual([target.id]);
  });

  it("片方だけ設定されているカードは除外される", () => {
    const db = setupDb();
    const { service, columnRepo, cardRepo } = setupService(db);
    const column = columnRepo.create("列1", 0);
    cardRepo.create({
      columnId: column.id,
      title: "startDateのみ",
      startDate: "2026-01-01",
    });

    const result = service.getGanttData();

    expect(result).toHaveLength(0);
  });
});

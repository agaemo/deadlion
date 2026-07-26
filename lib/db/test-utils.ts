import { randomUUID } from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * テスト用に一意な一時DBファイルのパスを発行する。
 * 実DBファイル（./data/app.db）とは無関係な os.tmpdir() 配下を使う。
 */
export function createTmpDbPath(): string {
  return join(tmpdir(), `deadlion-test-${randomUUID()}.db`);
}

/**
 * createTmpDbPath() で発行したパスに対応するSQLiteファイル
 * （本体 / -shm / -wal）を削除する。
 */
export function cleanupTmpDbFile(path: string): void {
  for (const suffix of ["", "-shm", "-wal"]) {
    const target = `${path}${suffix}`;
    if (existsSync(target)) {
      rmSync(target);
    }
  }
}

import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * lib/db/index.ts の `db` シングルトンは、`DATABASE_URL` が未設定の場合に
 * 実DBファイル（./data/app.db）へ接続する設計を想定している。
 * テスト実行時に誤って実DBファイルへ接続・書き込みしてしまわないよう、
 * 各テストが明示的に `DATABASE_URL` を上書きし忘れた場合の保険として、
 * ここでテスト用の一時パスをデフォルト値として設定しておく。
 */
process.env.DATABASE_URL ??= join(
  tmpdir(),
  `deadlion-test-default-${randomUUID()}.db`,
);

/**
 * jsdom は ResizeObserver を実装していない。@dnd-kit/core が
 * useLayoutEffect 内で `new ResizeObserver(...)` を呼ぶため、
 * jsdom環境のコンポーネントテストでは未定義のままだとレンダーが
 * サイレントに失敗する（例外がテストのアサーションまで伝播しない）。
 */
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverMock;
}

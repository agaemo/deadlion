#!/usr/bin/env node
/**
 * PostToolUse hook: Write|Edit
 * 変更ファイルを prettier で整形する。
 */

const { execFileSync } = require("child_process");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = data?.tool_input?.file_path;
  if (!filePath || !/\.(ts|tsx|js|jsx|css|json|md)$/.test(filePath)) {
    process.exit(0);
  }

  try {
    execFileSync("pnpm", ["exec", "prettier", "--write", filePath], {
      stdio: "pipe",
    });
  } catch {
    // prettier対象外の設定ファイル等はエラーを無視する
  }

  process.exit(0);
});

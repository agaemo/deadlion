#!/usr/bin/env node
/**
 * Stop hook
 * oxlint と tsc --noEmit を実行し、エラーがあれば停止をブロックして報告する。
 */

const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    if (data.stop_hook_active) process.exit(0);
  } catch (_) {}

  const problems = [];

  try {
    execSync('pnpm exec oxlint .', { stdio: 'pipe' });
  } catch (e) {
    problems.push('oxlint:\n' + e.stdout?.toString());
  }

  try {
    execSync('pnpm exec tsc --noEmit', { stdio: 'pipe' });
  } catch (e) {
    problems.push('tsc --noEmit:\n' + e.stdout?.toString());
  }

  if (problems.length > 0) {
    console.log(problems.join('\n\n'));
    process.exit(2);
  }

  process.exit(0);
});

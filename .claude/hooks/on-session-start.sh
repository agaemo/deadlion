#!/bin/sh
# SessionStart hook: git ブランチと未コミット変更を表示する
cat > /dev/null

branch=$(git branch --show-current 2>/dev/null) || exit 0
printf 'Git ブランチ: %s\n' "$branch"

status=$(git status --short 2>/dev/null)
if [ -n "$status" ]; then
  printf '未コミットの変更:\n%s\n' "$status"
fi

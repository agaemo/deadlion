#!/bin/sh
set -e

SECRET_FILE="/app/data/.auth_secret"

# AUTH_SECRET が未設定の場合、ファイルから読み込むか新規生成
if [ -z "$AUTH_SECRET" ]; then
  if [ -f "$SECRET_FILE" ]; then
    AUTH_SECRET=$(cat "$SECRET_FILE")
  else
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    echo "$AUTH_SECRET" > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE"
  fi
  export AUTH_SECRET
fi

# AUTH_PASSWORD が未設定の場合はデフォルト値（初回ログイン時に強制変更）
export AUTH_PASSWORD="${AUTH_PASSWORD:-changeme}"

AUTH_PASSWORD_HASH=$(node -e "
  const {randomBytes, scryptSync} = require('crypto');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(process.env.AUTH_PASSWORD, salt, 64).toString('hex');
  console.log(salt + ':' + hash);
")
export AUTH_PASSWORD_HASH

exec node server.js

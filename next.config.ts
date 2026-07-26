import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // better-sqlite3 はネイティブモジュールのためバンドル対象から除外
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;

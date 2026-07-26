import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("認証が必要です");
  }
  if (!session.user.isAdmin) {
    throw new Error("管理者権限が必要です");
  }
  return session;
}

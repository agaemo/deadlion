import type { ReactNode } from "react";
import { auth } from "@/auth";
import { Header } from "@/components/layout/Header";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin ?? false;

  return (
    <div className="flex h-full flex-col">
      <Header isAdmin={isAdmin} />
      <main className="min-h-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}

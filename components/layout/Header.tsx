"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
  { href: "/", label: "ボード" },
  { href: "/tasks", label: "タスク一覧" },
  { href: "/gantt", label: "ガントチャート" },
];

const ADMIN_NAV_ITEMS = [{ href: "/admin/users", label: "ユーザー管理" }];

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-heading text-lg font-extrabold text-accent-strong">
            deadlion
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {allNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-accent text-white"
                  : "text-foreground hover:bg-primary-100/40"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <form action={logout}>
        <Button type="submit" variant="ghost">
          ログアウト
        </Button>
      </form>
    </header>
  );
}

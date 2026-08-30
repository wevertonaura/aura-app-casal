"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/actions/auth";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-bg-elevated px-4 py-6 lg:flex">
      <Link href="/app/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
        <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-surface text-text border border-border-strong"
                  : "text-text-muted hover:bg-surface hover:text-text"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-lilac")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-2 px-2 text-xs text-text-faint">Logado como</div>
        <div className="mb-3 flex items-center gap-2 px-2 text-sm text-text">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-marsala text-xs font-semibold text-white">
            {userName.charAt(0).toUpperCase()}
          </span>
          {userName}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

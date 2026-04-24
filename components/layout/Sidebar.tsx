"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, List, Sparkles, Settings as SettingsIcon, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Дашборд", Icon: Home },
  { href: "/history", label: "История", Icon: List },
  { href: "/insights", label: "Инсайты", Icon: Sparkles },
  { href: "/settings", label: "Настройки", Icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-border bg-surface px-4 py-6">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="font-serif text-lg">Finley</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Главная", Icon: Home },
  { href: "/history", label: "История", Icon: List },
  { href: "/insights", label: "Инсайты", Icon: Sparkles },
  { href: "/settings", label: "Настройки", Icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Основная навигация"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-primary")} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

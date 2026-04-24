"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingAddButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label="Добавить транзакцию"
      className={cn(
        "fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+16px)] right-4 z-40 md:bottom-6 md:right-6",
        "flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-lg",
        "transition-transform active:scale-95 hover:brightness-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <Plus className="h-5 w-5" />
      <span className="text-sm font-semibold">Добавить</span>
    </button>
  );
}

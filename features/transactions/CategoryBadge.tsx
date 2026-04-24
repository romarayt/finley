"use client";

import { CATEGORY_META, type Category } from "@/features/categories/catalog";
import { cn } from "@/lib/utils";

type Props = {
  category: Category;
  size?: "sm" | "md";
  withIcon?: boolean;
  className?: string;
};

export function CategoryBadge({ category, size = "md", withIcon = true, className }: Props) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs",
        className
      )}
      style={{
        backgroundColor: `hsl(var(--${meta.colorVar}) / 0.14)`,
        color: `hsl(var(--${meta.colorVar}))`,
      }}
    >
      {withIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {category}
    </span>
  );
}

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span
      className={cn("grid place-items-center rounded-md", className)}
      style={{
        backgroundColor: `hsl(var(--${meta.colorVar}) / 0.14)`,
        color: `hsl(var(--${meta.colorVar}))`,
      }}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

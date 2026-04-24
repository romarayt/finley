import { CategoryIcon } from "@/features/transactions/CategoryBadge";
import { formatMoney, type Currency } from "@/lib/money";
import type { CategorySlice } from "@/lib/aggregates";

export function TopCategories({ categories, currency }: { categories: CategorySlice[]; currency: Currency }) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">Добавь траты, чтобы увидеть топ категорий.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {categories.map((c, i) => (
        <li key={c.category} className="flex items-center gap-3">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground tabular">
            {i + 1}
          </span>
          <CategoryIcon category={c.category} className="h-9 w-9" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{c.category}</p>
            <p className="text-xs text-muted-foreground tabular">{c.count} транзакций</p>
          </div>
          <span className="money text-sm font-medium shrink-0">
            {formatMoney(c.amount, currency, { compact: true })}
          </span>
        </li>
      ))}
    </ol>
  );
}

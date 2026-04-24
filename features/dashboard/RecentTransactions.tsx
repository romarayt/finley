import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TransactionDto } from "@/features/transactions/schema";
import { CategoryIcon } from "@/features/transactions/CategoryBadge";
import { formatMoney, type Currency } from "@/lib/money";
import { formatShortDate } from "@/lib/date";

export function RecentTransactions({
  items,
  currency,
}: {
  items: TransactionDto[];
  currency: Currency;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col">
      <ul className="divide-y divide-border">
        {items.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2.5">
            <CategoryIcon category={t.category} className="h-8 w-8" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.description}</p>
              <p className="text-xs text-muted-foreground tabular">{formatShortDate(new Date(t.occurredAt))}</p>
            </div>
            <span
              className={`money text-sm shrink-0 ${
                t.type === "INCOME" ? "text-success" : "text-foreground"
              }`}
            >
              {t.type === "INCOME" ? "+" : "−"}
              {formatMoney(t.amount, t.currency as Currency, { compact: true })}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/history"
        className="mt-3 inline-flex items-center gap-1 self-end text-xs text-muted-foreground hover:text-foreground"
      >
        Вся история <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

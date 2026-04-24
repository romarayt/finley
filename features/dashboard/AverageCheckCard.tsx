import { TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function AverageCheckCard({
  value,
  trend,
  currency,
}: {
  value: number;
  trend: number;
  currency: Currency;
}) {
  const hasTrend = Math.abs(trend) >= 1;
  const up = trend > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="money font-serif text-3xl text-foreground">{formatMoney(Math.round(value), currency)}</p>
      {hasTrend ? (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium w-fit",
            up ? "text-warning" : "text-success"
          )}
        >
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{up ? "+" : ""}{trend.toFixed(0)}% vs прошлый месяц</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Стабильно vs прошлый месяц</p>
      )}
    </div>
  );
}

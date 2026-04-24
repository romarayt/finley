"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { formatMoney, type Currency } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  remaining: number;
  budget: number;
  spent: number;
  progress: number;
  daysLeft: number;
  currency: Currency;
};

export function HeroBudgetCard({ remaining, budget, spent, progress, daysLeft, currency }: Props) {
  const tone: "success" | "warning" | "danger" =
    remaining < 0 ? "danger" : progress >= 80 ? "warning" : "success";

  const copy =
    remaining < 0 ? "Превысил бюджет на" : progress >= 80 ? "Почти весь бюджет" : "Осталось в бюджете";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border p-6 md:p-10 shadow-xl",
        tone === "success" && "bg-gradient-to-br from-success-soft via-surface to-surface",
        tone === "warning" && "bg-gradient-to-br from-warning-soft via-surface to-surface",
        tone === "danger" && "bg-gradient-to-br from-danger-soft via-surface to-surface"
      )}
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{copy}</p>
      <AnimatedMoney value={Math.abs(remaining)} currency={currency} tone={tone} />
      <div className="mt-6 flex flex-col gap-2">
        <Progress
          value={Math.min(100, progress)}
          className="h-2 bg-muted"
          indicatorClassName={cn(
            tone === "success" && "bg-success",
            tone === "warning" && "bg-warning",
            tone === "danger" && "bg-danger"
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Потрачено{" "}
            <span className="money text-foreground">
              {formatMoney(spent, currency)}
            </span>{" "}
            из <span className="money">{formatMoney(budget, currency)}</span>
          </span>
          <span>{progress.toFixed(0)}%</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {daysLeft === 0 ? "Последний день месяца" : `На ${daysLeft} ${pluralDays(daysLeft)} до конца месяца`}
      </p>
    </div>
  );
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
}

function AnimatedMoney({
  value,
  currency,
  tone,
}: {
  value: number;
  currency: Currency;
  tone: "success" | "warning" | "danger";
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 500;
    const from = displayed;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div
      className={cn(
        "mt-2 font-serif font-normal leading-none money tracking-tight",
        "text-[clamp(3rem,10vw,6rem)]",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning",
        tone === "danger" && "text-danger"
      )}
    >
      {formatMoney(Math.round(displayed), currency)}
    </div>
  );
}

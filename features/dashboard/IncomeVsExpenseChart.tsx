"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { formatMoney, type Currency } from "@/lib/money";

export function IncomeVsExpenseChart({
  data,
  currency,
}: {
  data: { date: string; income: number; expense: number }[];
  currency: Currency;
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 6, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.18} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(parseISO(d), "d MMM", { locale: ru })}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}к` : String(v))}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--surface))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(d) => format(parseISO(d as string), "d MMMM, EEEE", { locale: ru })}
            formatter={(value, name) => [formatMoney(Number(value), currency), name === "income" ? "Доход" : "Расход"] as [string, string]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            fill="url(#gradIncome)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            fill="url(#gradExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

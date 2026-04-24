"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_META } from "@/features/categories/catalog";
import type { CategorySlice } from "@/lib/aggregates";
import { formatMoney, type Currency } from "@/lib/money";

export function CategoryDonut({ data, currency }: { data: CategorySlice[]; currency: Currency }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Пока нет расходов в этом месяце
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-6">
      <div className="h-[200px] w-full md:w-[220px] shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
              stroke="hsl(var(--surface))"
              paddingAngle={2}
            >
              {data.map((d) => (
                <Cell key={d.category} fill={CATEGORY_META[d.category].hex} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [formatMoney(Number(value), currency), ""] as [string, string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex-1 flex flex-col gap-2">
        {data.slice(0, 6).map((d) => (
          <li key={d.category} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_META[d.category].hex }} />
              <span className="truncate">{d.category}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
              <span className="money text-foreground">{formatMoney(d.amount, currency, { compact: true })}</span>
              <span className="tabular text-xs">{d.share.toFixed(0)}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

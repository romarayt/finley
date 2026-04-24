import { getDashboardAggregates } from "@/lib/aggregates";
import { HeroBudgetCard } from "@/features/dashboard/HeroBudgetCard";
import { BentoGrid } from "@/features/dashboard/BentoGrid";
import { IncomeVsExpenseChart } from "@/features/dashboard/IncomeVsExpenseChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/states/EmptyState";
import { Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const agg = await getDashboardAggregates();

  if (agg.totalTxCount === 0) {
    return (
      <AppShell>
        <EmptyState
          icon={Wallet}
          title="Пока пусто"
          description="Добавь первую транзакцию одной фразой — нажми на «+ Добавить» внизу справа."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Дашборд</p>
            <h1 className="font-serif text-2xl md:text-3xl leading-tight">Этот месяц</h1>
          </div>
        </header>

        <HeroBudgetCard
          remaining={agg.monthRemaining}
          budget={agg.monthlyBudget}
          spent={agg.monthSpent}
          progress={agg.monthProgress}
          daysLeft={agg.daysLeft}
          currency={agg.currency}
        />

        <BentoGrid agg={agg} />

        <Card>
          <CardHeader>
            <CardTitle>Доходы vs расходы · 30 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeVsExpenseChart data={agg.dailySeries} currency={agg.currency} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

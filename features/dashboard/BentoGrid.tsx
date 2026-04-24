import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CategoryDonut } from "./CategoryDonut";
import { TopCategories } from "./TopCategories";
import { AverageCheckCard } from "./AverageCheckCard";
import { RecentTransactions } from "./RecentTransactions";
import type { DashboardAggregates } from "@/lib/aggregates";

export function BentoGrid({ agg }: { agg: DashboardAggregates }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="md:row-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Расходы по категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryDonut data={agg.categories} currency={agg.currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Топ-3 категории</CardTitle>
        </CardHeader>
        <CardContent>
          <TopCategories categories={agg.topCategories} currency={agg.currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Средний чек</CardTitle>
        </CardHeader>
        <CardContent>
          <AverageCheckCard value={agg.averageCheck} trend={agg.averageCheckTrend} currency={agg.currency} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Последние 5 транзакций</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions items={agg.recentTransactions} currency={agg.currency} />
        </CardContent>
      </Card>
    </div>
  );
}

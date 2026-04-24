import { generateInsights } from "@/features/insights/generator";
import { AppShell } from "@/components/layout/AppShell";
import { InsightCard } from "@/features/insights/InsightCard";
import { EmptyState } from "@/components/states/EmptyState";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const result = await generateInsights();

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Инсайты</p>
            <h1 className="font-serif text-2xl md:text-3xl leading-tight">Что изменить в поведении</h1>
          </div>
        </header>

        {result.status === "empty" && (
          <EmptyState
            icon={Sparkles}
            title="Пока мало данных"
            description={result.reason}
          />
        )}

        {result.status === "error" && (
          <EmptyState
            icon={Sparkles}
            title="AI временно недоступен"
            description={`Попробуй обновить страницу. (${result.message})`}
          />
        )}

        {result.status === "ready" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

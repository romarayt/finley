import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsForm } from "@/features/settings/SettingsForm";
import { ExportButtons } from "@/features/settings/ExportButtons";
import { DangerZone } from "@/features/settings/DangerZone";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, txCount] = await Promise.all([
    prisma.settings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} }),
    prisma.transaction.count(),
  ]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Настройки</p>
          <h1 className="font-serif text-2xl md:text-3xl leading-tight">Параметры</h1>
        </header>

        <SettingsForm
          initialBudget={Number(settings.monthlyBudget)}
          initialCurrency={settings.currency as "RUB" | "USD" | "EUR"}
        />

        <ExportButtons />

        <DangerZone txCount={txCount} />
      </div>
    </AppShell>
  );
}

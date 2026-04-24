import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { HistoryView } from "@/features/transactions/HistoryView";
import type { Currency } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const settings = await prisma.settings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
  return (
    <AppShell>
      <HistoryView currency={settings.currency as Currency} />
    </AppShell>
  );
}

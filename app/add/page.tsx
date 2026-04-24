import { AppShell } from "@/components/layout/AppShell";
import { QuickAddForm } from "@/features/transactions/QuickAddForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AddPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-2xl">
        <header>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Быстрое добавление</p>
          <h1 className="font-serif text-2xl md:text-3xl leading-tight">Новая транзакция</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Опиши одной фразой — AI распарсит</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickAddForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

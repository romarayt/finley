"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function DangerZone({ txCount }: { txCount: number }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function reset() {
    setDeleting(true);
    const res = await fetch("/api/reset", { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("Все данные удалены");
      router.refresh();
    } else {
      toast.error("Не получилось удалить");
    }
  }

  async function logout() {
    const res = await fetch("/api/auth", { method: "DELETE" });
    if (res.ok) window.location.href = "/login";
  }

  return (
    <Card className="border-danger/30">
      <CardHeader>
        <CardTitle className="text-danger">Опасная зона</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button variant="outline" onClick={logout}>Выйти</Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={txCount === 0}>
              <Trash2 className="h-4 w-4" /> Удалить все данные
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить все данные?</AlertDialogTitle>
              <AlertDialogDescription>
                Это необратимо. Будут удалены {txCount} {plural(txCount, "транзакция", "транзакции", "транзакций")} и все настройки инсайтов.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={reset} disabled={deleting}>
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Удалить {txCount} {plural(txCount, "транзакция", "транзакции", "транзакций")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

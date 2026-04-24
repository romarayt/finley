"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Category } from "@/features/categories/catalog";
import type { TransactionDto } from "./schema";
import { Loader2 } from "lucide-react";

export function EditDialog({
  tx,
  onClose,
  onSaved,
}: {
  tx: TransactionDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<TransactionDto | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(tx);
  }, [tx]);

  async function save() {
    if (!form) return;
    setSaving(true);
    const res = await fetch(`/api/transactions/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: form.amount,
        currency: form.currency,
        category: form.category,
        description: form.description,
        type: form.type,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Обновлено");
      router.refresh();
      onSaved();
      onClose();
    } else {
      toast.error("Не получилось");
    }
  }

  return (
    <Dialog open={!!tx} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать</DialogTitle>
        </DialogHeader>
        {form && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Описание</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Сумма</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Категория</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as Category })}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "INCOME" | "EXPENSE" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Расход</SelectItem>
                  <SelectItem value="INCOME">Доход</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Валюта</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as "RUB" | "USD" | "EUR" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">RUB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Отмена</Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "./CategoryBadge";
import { CATEGORIES, type Category } from "@/features/categories/catalog";
import type { CategorizationResult } from "@/features/ai/schema";
import { cn } from "@/lib/utils";
import { formatMoney, type Currency } from "@/lib/money";

type Preview = CategorizationResult & { occurredAt?: string };

export function QuickAddForm({ onDone }: { onDone?: () => void }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [phase, setPhase] = useState<"idle" | "parsing" | "long" | "timeout">("idle");
  const [saving, setSaving] = useState(false);
  const [fallback, setFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function parse(raw: string) {
    setPhase("parsing");
    setPreview(null);
    setFallback(false);

    const longTimer = setTimeout(() => setPhase("long"), 3000);
    const abortTimer = setTimeout(() => setPhase("timeout"), 10_500);

    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      clearTimeout(longTimer);
      clearTimeout(abortTimer);

      if (!res.ok) {
        setPhase("idle");
        setFallback(true);
        const data = await res.json().catch(() => ({ error: "Ошибка AI" }));
        toast.error(data.error ?? "AI не смог распарсить. Заполни поля вручную.");
        return;
      }

      const data: CategorizationResult = await res.json();
      setPreview(data);
      setPhase("idle");
    } catch {
      clearTimeout(longTimer);
      clearTimeout(abortTimer);
      setPhase("idle");
      setFallback(true);
      toast.error("Не удалось связаться с AI. Заполни поля вручную.");
    }
  }

  function handleSubmitText(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    parse(text.trim());
  }

  async function save() {
    if (!preview) return;
    setSaving(true);

    const payload = {
      amount: preview.amount > 0 ? preview.amount : 0,
      currency: preview.currency,
      category: preview.category,
      description: preview.description,
      type: preview.type,
      occurredAt: preview.occurredAt ?? new Date().toISOString(),
      aiConfidence: preview.confidence,
    };

    if (payload.amount <= 0) {
      toast.error("Укажи сумму");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? "Не получилось сохранить");
      return;
    }

    toast.success("Сохранил ✓");
    setText("");
    setPreview(null);
    setFallback(false);
    startTransition(() => {
      router.refresh();
      onDone?.();
    });
  }

  function reset() {
    setPreview(null);
    setText("");
    setFallback(false);
    inputRef.current?.focus();
  }

  const showManual = fallback || (preview && preview.amount === 0);

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmitText} className="flex gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Например: потратил 1200 на обед с Никой"
          className="h-12 text-base"
          disabled={phase !== "idle" || !!preview}
        />
        {!preview && (
          <Button type="submit" size="lg" disabled={phase !== "idle" || !text.trim()}>
            {phase === "parsing" || phase === "long" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Распарсить
          </Button>
        )}
      </form>

      {phase === "parsing" && (
        <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> AI классифицирует…
        </div>
      )}
      {phase === "long" && (
        <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-warning">
          <Loader2 className="h-4 w-4 animate-spin" /> Это занимает дольше обычного…
        </div>
      )}
      {phase === "timeout" && (
        <div className="flex items-center gap-2 text-sm text-danger">
          AI не ответил.
          <Button size="sm" variant="outline" onClick={() => parse(text)}>Повторить</Button>
        </div>
      )}

      {preview && !showManual && (
        <PreviewCard preview={preview} onChange={setPreview} onReset={reset} onSave={save} saving={saving} />
      )}

      {showManual && (
        <ManualForm
          initial={preview ?? undefined}
          onReset={reset}
          onSave={async (p) => {
            setPreview({ ...p, confidence: 1 });
            await Promise.resolve();
            const payload = {
              ...p,
              occurredAt: p.occurredAt ?? new Date().toISOString(),
              aiConfidence: 1,
            };
            setSaving(true);
            const res = await fetch("/api/transactions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            setSaving(false);
            if (!res.ok) {
              toast.error("Не получилось сохранить");
              return;
            }
            toast.success("Сохранил ✓");
            setText("");
            setPreview(null);
            setFallback(false);
            startTransition(() => {
              router.refresh();
              onDone?.();
            });
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

function PreviewCard({
  preview,
  onChange,
  onReset,
  onSave,
  saving,
}: {
  preview: Preview;
  onChange: (p: Preview) => void;
  onReset: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState<"amount" | "description" | null>(null);
  const confidenceLabel =
    preview.confidence >= 0.8 ? "высокая" : preview.confidence >= 0.5 ? "средняя" : "низкая";
  const confidenceVariant =
    preview.confidence >= 0.8 ? "success" : preview.confidence >= 0.5 ? "warning" : "danger";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> AI распознал
        </div>
        <span
          className={cn(
            "rounded-sm px-2 py-0.5 text-xs font-medium",
            confidenceVariant === "success" && "bg-success-soft text-success",
            confidenceVariant === "warning" && "bg-warning-soft text-warning",
            confidenceVariant === "danger" && "bg-danger-soft text-danger"
          )}
        >
          Уверенность: {confidenceLabel}
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <button
          onClick={() => setEditing("amount")}
          className="money text-2xl font-semibold text-foreground hover:bg-muted rounded-md px-1 -mx-1"
        >
          {preview.type === "INCOME" ? "+" : "−"}
          {formatMoney(preview.amount, preview.currency as Currency)}
        </button>
        <button
          onClick={() => onChange({ ...preview, type: preview.type === "EXPENSE" ? "INCOME" : "EXPENSE" })}
          className={cn(
            "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
            preview.type === "EXPENSE" ? "bg-muted text-muted-foreground" : "bg-success-soft text-success"
          )}
        >
          {preview.type === "EXPENSE" ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
          {preview.type === "EXPENSE" ? "Расход" : "Доход"}
        </button>
      </div>

      {editing === "amount" && (
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            value={preview.amount}
            onChange={(e) => onChange({ ...preview, amount: Number(e.target.value) })}
            onBlur={() => setEditing(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(null)}
            autoFocus
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={preview.category}
          onValueChange={(v) => onChange({ ...preview, category: v as Category })}
        >
          <SelectTrigger className="h-8 w-fit min-w-[140px] gap-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                <CategoryBadge category={c} size="sm" />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={preview.currency}
          onValueChange={(v) => onChange({ ...preview, currency: v as "RUB" | "USD" | "EUR" })}
        >
          <SelectTrigger className="h-8 w-fit gap-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="RUB">RUB ₽</SelectItem>
            <SelectItem value="USD">USD $</SelectItem>
            <SelectItem value="EUR">EUR €</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Описание</Label>
        {editing === "description" ? (
          <Input
            value={preview.description}
            onChange={(e) => onChange({ ...preview, description: e.target.value })}
            onBlur={() => setEditing(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(null)}
            autoFocus
            className="mt-1"
          />
        ) : (
          <button
            onClick={() => setEditing("description")}
            className="mt-1 w-full text-left text-sm hover:bg-muted rounded-md px-2 py-1 -mx-2"
          >
            {preview.description}
          </button>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onReset} disabled={saving}>
          Отмена
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить
        </Button>
      </div>
    </div>
  );
}

function ManualForm({
  initial,
  onReset,
  onSave,
  saving,
}: {
  initial?: Preview;
  onReset: () => void;
  onSave: (p: Omit<Preview, "confidence"> & { amount: number }) => void;
  saving: boolean;
}) {
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Другое");
  const [currency, setCurrency] = useState<"RUB" | "USD" | "EUR">(initial?.currency ?? "RUB");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<"INCOME" | "EXPENSE">(initial?.type ?? "EXPENSE");

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">Заполни вручную:</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Описание</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Например: Обед" className="mt-1" />
        </div>
        <div>
          <Label>Сумма</Label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Валюта</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v as "RUB" | "USD" | "EUR")}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="RUB">RUB ₽</SelectItem>
              <SelectItem value="USD">USD $</SelectItem>
              <SelectItem value="EUR">EUR €</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Категория</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Тип</Label>
          <Select value={type} onValueChange={(v) => setType(v as "INCOME" | "EXPENSE")}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Расход</SelectItem>
              <SelectItem value="INCOME">Доход</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onReset} disabled={saving}>Отмена</Button>
        <Button
          disabled={saving || !description.trim() || !amount || Number(amount) <= 0}
          onClick={() =>
            onSave({
              amount: Number(amount),
              currency,
              category,
              description: description.trim(),
              type,
            })
          }
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Category } from "@/features/categories/catalog";
import { TransactionRow } from "./TransactionRow";
import { groupByDay, formatDayHeader } from "@/lib/date";
import { formatMoney, type Currency } from "@/lib/money";
import type { TransactionDto } from "./schema";
import { EmptyState } from "@/components/states/EmptyState";
import { Wallet } from "lucide-react";
import { EditDialog } from "./EditDialog";

type Page = {
  items: TransactionDto[];
  nextCursor: string | null;
  total: number;
  totalAmount: number;
};

const fetcher = async (url: string): Promise<Page> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  return r.json();
};

export function HistoryView({ currency }: { currency: Currency }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cats, setCats] = useState<Category[]>([]);
  const [type, setType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [editing, setEditing] = useState<TransactionDto | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const getKey = (pageIndex: number, prev: Page | null) => {
    if (prev && !prev.nextCursor) return null;
    const params = new URLSearchParams({ take: "50" });
    if (prev?.nextCursor) params.set("cursor", prev.nextCursor);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (cats.length > 0) params.set("categories", cats.join(","));
    if (type !== "ALL") params.set("type", type);
    return `/api/transactions?${params.toString()}`;
  };

  const { data, size, setSize, isLoading, mutate } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: true,
  });

  const items = useMemo(() => (data ?? []).flatMap((p) => p.items), [data]);
  const total = data?.[0]?.total ?? 0;
  const totalAmount = data?.[0]?.totalAmount ?? 0;
  const hasMore = Boolean(data?.[data.length - 1]?.nextCursor);
  const groups = useMemo(
    () => groupByDay(items.map((t) => ({ ...t, occurredAt: new Date(t.occurredAt) }))),
    [items]
  );

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setSize(size + 1);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, size, setSize]);

  const filtersActive = cats.length > 0 || type !== "ALL" || debouncedSearch.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">История</p>
          <h1 className="font-serif text-2xl md:text-3xl leading-tight">Транзакции</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {total} транзакций, сумма{" "}
          <span className="money text-foreground">{formatMoney(totalAmount, currency)}</span>
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по описанию"
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4" />
              Категории{cats.length > 0 ? ` (${cats.length})` : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Категории</p>
              {cats.length > 0 && (
                <button onClick={() => setCats([])} className="text-xs text-muted-foreground hover:text-foreground">
                  Сбросить
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={cats.includes(c)}
                    onCheckedChange={(v) => {
                      if (v) setCats([...cats, c]);
                      else setCats(cats.filter((x) => x !== c));
                    }}
                  />
                  <span className="text-sm">{c}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Всё</SelectItem>
            <SelectItem value="EXPENSE">Расходы</SelectItem>
            <SelectItem value="INCOME">Доходы</SelectItem>
          </SelectContent>
        </Select>

        {filtersActive && (
          <Button
            variant="ghost"
            onClick={() => {
              setCats([]);
              setType("ALL");
              setSearch("");
            }}
          >
            <X className="h-4 w-4" /> Сброс
          </Button>
        )}
      </div>

      {isLoading && items.length === 0 && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={Wallet}
          title={filtersActive ? "Ничего не найдено" : "История пуста"}
          description={filtersActive ? "Попробуй изменить фильтры." : "Добавь первую транзакцию."}
        />
      )}

      <div className="flex flex-col">
        {groups.map(({ day, items: dayItems }) => (
          <section key={day.getTime()} className="flex flex-col">
            <h3 className="sticky top-0 z-10 bg-background/90 backdrop-blur py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {formatDayHeader(day)}
            </h3>
            <div className="flex flex-col">
              {dayItems.map((t) => (
                <TransactionRow key={t.id} tx={t as unknown as TransactionDto} onEdit={setEditing} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="py-6 flex justify-center">
          <Skeleton className="h-10 w-32" />
        </div>
      )}

      <EditDialog tx={editing} onClose={() => setEditing(null)} onSaved={() => mutate()} />
    </div>
  );
}

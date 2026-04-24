import type { Transaction } from "@prisma/client";
import { format } from "date-fns";

const BOM = "﻿";
const HEADERS = ["Дата", "Время", "Категория", "Описание", "Сумма", "Валюта", "Тип"];

function escape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function transactionsToCsv(txns: Transaction[]): string {
  const rows = txns.map((t) => [
    format(t.occurredAt, "yyyy-MM-dd"),
    format(t.occurredAt, "HH:mm"),
    t.category,
    t.description,
    Number(t.amount).toFixed(2),
    t.currency,
    t.type === "INCOME" ? "Доход" : "Расход",
  ]);
  return BOM + [HEADERS, ...rows].map((row) => row.map((c) => escape(String(c))).join(",")).join("\n");
}

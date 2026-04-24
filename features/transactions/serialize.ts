import type { Transaction } from "@prisma/client";
import type { TransactionDto } from "./schema";
import { normalizeCategory } from "@/features/categories/catalog";

export function serializeTransaction(tx: Transaction): TransactionDto {
  return {
    id: tx.id,
    amount: Number(tx.amount),
    currency: (tx.currency as "RUB" | "USD" | "EUR") ?? "RUB",
    category: normalizeCategory(tx.category),
    description: tx.description,
    type: tx.type,
    occurredAt: tx.occurredAt.toISOString(),
    createdAt: tx.createdAt.toISOString(),
    aiConfidence: tx.aiConfidence,
  };
}

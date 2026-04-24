import { z } from "zod";
import { CATEGORIES } from "@/features/categories/catalog";

export const TransactionDtoSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.enum(["RUB", "USD", "EUR"]),
  category: z.enum(CATEGORIES),
  description: z.string(),
  type: z.enum(["INCOME", "EXPENSE"]),
  occurredAt: z.string(),
  createdAt: z.string(),
  aiConfidence: z.number().nullable(),
});
export type TransactionDto = z.infer<typeof TransactionDtoSchema>;

export const CreateTransactionSchema = z.object({
  amount: z.number().positive().max(100_000_000),
  currency: z.enum(["RUB", "USD", "EUR"]).default("RUB"),
  category: z.enum(CATEGORIES),
  description: z.string().min(1).max(200),
  type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
  occurredAt: z.string().datetime().optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
});
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = CreateTransactionSchema.partial();
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;

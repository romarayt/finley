import { z } from "zod";
import { CATEGORIES } from "@/features/categories/catalog";

export const CategorizationResultSchema = z.object({
  amount: z.number().min(0).max(100_000_000),
  currency: z.enum(["RUB", "USD", "EUR"]),
  category: z.enum(CATEGORIES),
  description: z.string().min(1).max(200),
  type: z.enum(["INCOME", "EXPENSE"]),
  occurredAt: z.string().datetime().or(z.string().date()).optional(),
  confidence: z.number().min(0).max(1),
});

export type CategorizationResult = z.infer<typeof CategorizationResultSchema>;

export const InsightsSchema = z.object({
  insights: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        body: z.string().min(1).max(360),
        tone: z.enum(["positive", "warning", "neutral"]),
        icon: z.string().min(1).max(40),
      })
    )
    .min(1)
    .max(5),
});

export type Insights = z.infer<typeof InsightsSchema>;

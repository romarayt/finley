import { prisma } from "@/lib/db";
import { openai, OPENAI_MODEL } from "@/features/ai/client";
import { INSIGHTS_SYSTEM_PROMPT } from "@/features/ai/prompts";
import { InsightsSchema, type Insights } from "@/features/ai/schema";
import { getInsightAggregates } from "@/lib/aggregates";
import { zodToJsonSchema } from "zod-to-json-schema";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MIN_TX = 20;

const jsonSchemaRaw = zodToJsonSchema(InsightsSchema, { name: "Insights", target: "openAi" }) as {
  definitions?: Record<string, Record<string, unknown>>;
} & Record<string, unknown>;

const jsonSchema: Record<string, unknown> = jsonSchemaRaw.definitions?.Insights ?? jsonSchemaRaw;

export type InsightsResult =
  | { status: "ready"; insights: Insights["insights"] }
  | { status: "empty"; reason: string; needed: number }
  | { status: "error"; message: string };

export async function generateInsights(): Promise<InsightsResult> {
  const agg = await getInsightAggregates();
  if (agg.totalTx < MIN_TX) {
    return {
      status: "empty",
      reason: `Добавь минимум ${MIN_TX} транзакций, чтобы увидеть инсайты.`,
      needed: MIN_TX - agg.totalTx,
    };
  }

  const cached = await prisma.insightCache.findFirst({ orderBy: { createdAt: "desc" } });
  if (cached && Date.now() - cached.createdAt.getTime() < CACHE_TTL_MS) {
    try {
      const parsed = JSON.parse(cached.payload);
      const validated = InsightsSchema.safeParse(parsed);
      if (validated.success) return { status: "ready", insights: validated.data.insights };
    } catch {}
  }

  const aggregatesForPrompt = {
    monthSpent: Math.round(agg.monthSpent),
    monthIncome: Math.round(agg.monthIncome),
    prevMonthSpent: Math.round(agg.prevMonthSpent),
    averageCheck: Math.round(agg.averageCheck),
    weekdayAvg: Math.round(agg.weekdayAvg),
    weekendAvg: Math.round(agg.weekendAvg),
    subscriptions: agg.subscriptions,
    categories: agg.categories
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
      .map((c) => ({ ...c, amount: Math.round(c.amount), prevAmount: Math.round(c.prevAmount) })),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await openai().chat.completions.create(
      {
        model: OPENAI_MODEL,
        temperature: 0.4,
        messages: [
          { role: "system", content: INSIGHTS_SYSTEM_PROMPT },
          { role: "user", content: `Агрегаты в JSON:\n${JSON.stringify(aggregatesForPrompt, null, 2)}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "Insights",
            schema: jsonSchema,
            strict: false,
          },
        },
      },
      { signal: controller.signal }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return { status: "error", message: "Пустой ответ AI" };

    const parsed = InsightsSchema.safeParse(JSON.parse(content));
    if (!parsed.success) return { status: "error", message: "AI вернул невалидный формат" };

    await prisma.insightCache.upsert({
      where: { id: 1 },
      create: { id: 1, payload: JSON.stringify(parsed.data), txCount: agg.totalTx },
      update: { payload: JSON.stringify(parsed.data), txCount: agg.totalTx, createdAt: new Date() },
    });

    return { status: "ready", insights: parsed.data.insights };
  } catch (err) {
    const msg = err instanceof Error ? (err.name === "AbortError" ? "Таймаут AI" : err.message) : "Ошибка";
    return { status: "error", message: msg };
  } finally {
    clearTimeout(timeout);
  }
}

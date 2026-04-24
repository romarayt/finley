import { NextResponse } from "next/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { openai, OPENAI_MODEL } from "@/features/ai/client";
import { CATEGORIZATION_SYSTEM_PROMPT } from "@/features/ai/prompts";
import { CategorizationResultSchema } from "@/features/ai/schema";

export const runtime = "nodejs";
export const maxDuration = 20;

const Body = z.object({ text: z.string().min(1).max(500) });

const jsonSchemaRaw = zodToJsonSchema(CategorizationResultSchema, {
  name: "CategorizationResult",
  target: "openAi",
}) as { definitions?: Record<string, Record<string, unknown>> } & Record<string, unknown>;

const jsonSchema: Record<string, unknown> =
  jsonSchemaRaw.definitions?.CategorizationResult ?? jsonSchemaRaw;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await openai().chat.completions.create(
      {
        model: OPENAI_MODEL,
        temperature: 0.1,
        messages: [
          { role: "system", content: CATEGORIZATION_SYSTEM_PROMPT },
          { role: "user", content: parsed.data.text },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "CategorizationResult",
            schema: jsonSchema,
            strict: false,
          },
        },
      },
      { signal: controller.signal }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "Пустой ответ AI" }, { status: 502 });

    const json = JSON.parse(content);
    const validated = CategorizationResultSchema.safeParse(json);
    if (!validated.success) {
      return NextResponse.json(
        { error: "AI вернул невалидный формат", details: validated.error.issues },
        { status: 422 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const message = isAbort
      ? "AI не ответил за 10 секунд. Попробуй ещё раз."
      : err instanceof Error
      ? err.message
      : "Ошибка AI";
    return NextResponse.json({ error: message }, { status: isAbort ? 504 : 500 });
  } finally {
    clearTimeout(timeout);
  }
}

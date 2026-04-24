import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  monthlyBudget: z.number().min(0).max(100_000_000).optional(),
  currency: z.enum(["RUB", "USD", "EUR"]).optional(),
});

export async function GET() {
  const s = await prisma.settings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
  return NextResponse.json({
    monthlyBudget: Number(s.monthlyBudget),
    currency: s.currency,
  });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Неверные данные" }, { status: 400 });

  const budget =
    parsed.data.monthlyBudget !== undefined ? new Prisma.Decimal(parsed.data.monthlyBudget) : undefined;
  const currency = parsed.data.currency;

  const s = await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      ...(budget !== undefined ? { monthlyBudget: budget } : {}),
      ...(currency ? { currency } : {}),
    },
    update: {
      ...(budget !== undefined ? { monthlyBudget: budget } : {}),
      ...(currency ? { currency } : {}),
    },
  });

  return NextResponse.json({
    monthlyBudget: Number(s.monthlyBudget),
    currency: s.currency,
  });
}

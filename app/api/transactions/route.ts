import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CreateTransactionSchema } from "@/features/transactions/schema";
import { serializeTransaction } from "@/features/transactions/serialize";
import { CATEGORIES } from "@/features/categories/catalog";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ListQuery = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(200).default(50),
  categories: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "ALL"]).default("ALL"),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ListQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });

  const { cursor, take, type, from, to, q } = parsed.data;
  const cats = parsed.data.categories?.split(",").filter((c) => (CATEGORIES as readonly string[]).includes(c));

  const where: Prisma.TransactionWhereInput = {};
  if (type !== "ALL") where.type = type;
  if (cats && cats.length > 0) where.category = { in: cats };
  if (from || to) {
    where.occurredAt = {};
    if (from) where.occurredAt.gte = new Date(from);
    if (to) where.occurredAt.lte = new Date(to);
  }
  if (q) where.description = { contains: q, mode: "insensitive" };

  const items = await prisma.transaction.findMany({
    where,
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > take;
  const slice = hasMore ? items.slice(0, take) : items;
  const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;

  const agg = await prisma.transaction.aggregate({
    where,
    _count: true,
    _sum: { amount: true },
  });

  return NextResponse.json({
    items: slice.map(serializeTransaction),
    nextCursor,
    total: agg._count,
    totalAmount: Number(agg._sum.amount ?? 0),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверные данные", details: parsed.error.issues }, { status: 400 });
  }

  const tx = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(parsed.data.amount),
      currency: parsed.data.currency,
      category: parsed.data.category,
      description: parsed.data.description,
      type: parsed.data.type,
      occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date(),
      aiConfidence: parsed.data.aiConfidence ?? null,
    },
  });

  await prisma.insightCache.deleteMany();

  return NextResponse.json(serializeTransaction(tx), { status: 201 });
}

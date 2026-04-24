import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { UpdateTransactionSchema } from "@/features/transactions/schema";
import { serializeTransaction } from "@/features/transactions/serialize";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json().catch(() => null);
  const parsed = UpdateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  const data: Prisma.TransactionUpdateInput = {};
  if (parsed.data.amount !== undefined) data.amount = new Prisma.Decimal(parsed.data.amount);
  if (parsed.data.currency) data.currency = parsed.data.currency;
  if (parsed.data.category) data.category = parsed.data.category;
  if (parsed.data.description) data.description = parsed.data.description;
  if (parsed.data.type) data.type = parsed.data.type;
  if (parsed.data.occurredAt) data.occurredAt = new Date(parsed.data.occurredAt);

  try {
    const tx = await prisma.transaction.update({ where: { id: params.id }, data });
    await prisma.insightCache.deleteMany();
    return NextResponse.json(serializeTransaction(tx));
  } catch {
    return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await prisma.transaction.delete({ where: { id: params.id } });
    await prisma.insightCache.deleteMany();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 });
  }
}

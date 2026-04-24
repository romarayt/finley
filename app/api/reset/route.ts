import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE() {
  await prisma.transaction.deleteMany();
  await prisma.correction.deleteMany();
  await prisma.insightCache.deleteMany();
  return NextResponse.json({ ok: true });
}

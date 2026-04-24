import { NextResponse } from "next/server";
import { generateInsights } from "@/features/insights/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function GET() {
  const result = await generateInsights();
  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Недоступно в production" }, { status: 403 });
  }

  const seedPath = path.join(process.cwd(), "prisma", "seed.ts");
  if (!existsSync(seedPath)) {
    return NextResponse.json({ error: "seed.ts не найден" }, { status: 500 });
  }

  try {
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit", cwd: process.cwd() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

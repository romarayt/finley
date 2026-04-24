import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, constantTimeEqualString } from "@/lib/session";

export const runtime = "nodejs";

const Body = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });

  if (!constantTimeEqualString(parsed.data.password, env.APP_PASSWORD)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

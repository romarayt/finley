import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { ReportDocument } from "@/features/export/pdf";
import { format, startOfMonth, endOfMonth } from "date-fns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");

  const now = new Date();
  const from = fromStr ? new Date(fromStr) : startOfMonth(now);
  const to = toStr ? new Date(toStr) : endOfMonth(now);

  const [txns, settings] = await Promise.all([
    prisma.transaction.findMany({
      where: { occurredAt: { gte: from, lte: to } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.settings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} }),
  ]);

  const monthSpent = txns.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + Number(t.amount), 0);
  const monthIncome = txns.filter((t) => t.type === "INCOME").reduce((a, t) => a + Number(t.amount), 0);

  const stream = await renderToStream(
    <ReportDocument
      txns={txns}
      from={from}
      to={to}
      monthSpent={monthSpent}
      monthIncome={monthIncome}
      currency={settings.currency}
    />
  );

  const filename = `finley-report-${format(from, "yyyy-MM-dd")}_${format(to, "yyyy-MM-dd")}.pdf`;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

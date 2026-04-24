import { prisma } from "@/lib/db";
import { endOfMonth, startOfMonth, subDays, subMonths, startOfDay, differenceInDays, eachDayOfInterval } from "date-fns";
import type { Currency } from "@/lib/money";
import { CATEGORIES, normalizeCategory, type Category } from "@/features/categories/catalog";
import { serializeTransaction } from "@/features/transactions/serialize";
import type { TransactionDto } from "@/features/transactions/schema";

export type CategorySlice = {
  category: Category;
  amount: number;
  count: number;
  share: number;
};

export type DashboardAggregates = {
  currency: Currency;
  monthlyBudget: number;
  monthSpent: number;
  monthIncome: number;
  monthRemaining: number;
  monthProgress: number;
  daysLeft: number;
  categories: CategorySlice[];
  topCategories: CategorySlice[];
  averageCheck: number;
  averageCheckTrend: number;
  recentTransactions: TransactionDto[];
  dailySeries: { date: string; income: number; expense: number }[];
  totalTxCount: number;
};

export async function getDashboardAggregates(): Promise<DashboardAggregates> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));
  const seriesStart = startOfDay(subDays(now, 29));

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  const currency = (settings.currency as Currency) ?? "RUB";
  const monthlyBudget = Number(settings.monthlyBudget);

  const [monthTxns, prevMonthTxns, seriesTxns, totalCount, recent] = await Promise.all([
    prisma.transaction.findMany({
      where: { occurredAt: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.transaction.findMany({
      where: { occurredAt: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),
    prisma.transaction.findMany({
      where: { occurredAt: { gte: seriesStart } },
      orderBy: { occurredAt: "asc" },
    }),
    prisma.transaction.count(),
    prisma.transaction.findMany({ orderBy: { occurredAt: "desc" }, take: 5 }),
  ]);

  let monthSpent = 0;
  let monthIncome = 0;
  const catMap = new Map<Category, { amount: number; count: number }>();

  for (const t of monthTxns) {
    const amt = Number(t.amount);
    if (t.type === "EXPENSE") {
      monthSpent += amt;
      const cat = normalizeCategory(t.category);
      const bucket = catMap.get(cat) ?? { amount: 0, count: 0 };
      bucket.amount += amt;
      bucket.count += 1;
      catMap.set(cat, bucket);
    } else {
      monthIncome += amt;
    }
  }

  const categories: CategorySlice[] = CATEGORIES.map((c) => {
    const b = catMap.get(c);
    return {
      category: c,
      amount: b?.amount ?? 0,
      count: b?.count ?? 0,
      share: monthSpent > 0 ? ((b?.amount ?? 0) / monthSpent) * 100 : 0,
    };
  })
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const topCategories = categories.slice(0, 3);

  const expenseTxns = monthTxns.filter((t) => t.type === "EXPENSE");
  const averageCheck = expenseTxns.length > 0 ? monthSpent / expenseTxns.length : 0;

  const prevExpenseTxns = prevMonthTxns.filter((t) => t.type === "EXPENSE");
  const prevSpent = prevExpenseTxns.reduce((a, t) => a + Number(t.amount), 0);
  const prevAvg = prevExpenseTxns.length > 0 ? prevSpent / prevExpenseTxns.length : 0;
  const averageCheckTrend = prevAvg > 0 ? ((averageCheck - prevAvg) / prevAvg) * 100 : 0;

  const seriesMap = new Map<string, { income: number; expense: number }>();
  for (const day of eachDayOfInterval({ start: seriesStart, end: now })) {
    seriesMap.set(day.toISOString().slice(0, 10), { income: 0, expense: 0 });
  }
  for (const t of seriesTxns) {
    const key = t.occurredAt.toISOString().slice(0, 10);
    const b = seriesMap.get(key);
    if (!b) continue;
    const amt = Number(t.amount);
    if (t.type === "INCOME") b.income += amt;
    else b.expense += amt;
  }
  const dailySeries = Array.from(seriesMap.entries()).map(([date, v]) => ({ date, ...v }));

  const monthRemaining = monthlyBudget - monthSpent;
  const monthProgress = monthlyBudget > 0 ? Math.min(100, (monthSpent / monthlyBudget) * 100) : 0;
  const daysLeft = Math.max(0, differenceInDays(monthEnd, now));

  return {
    currency,
    monthlyBudget,
    monthSpent,
    monthIncome,
    monthRemaining,
    monthProgress,
    daysLeft,
    categories,
    topCategories,
    averageCheck,
    averageCheckTrend,
    recentTransactions: recent.map(serializeTransaction),
    dailySeries,
    totalTxCount: totalCount,
  };
}

export type InsightAggregates = {
  monthSpent: number;
  monthIncome: number;
  prevMonthSpent: number;
  averageCheck: number;
  weekdayAvg: number;
  weekendAvg: number;
  subscriptions: Array<{ description: string; amount: number }>;
  categories: Array<{ category: string; amount: number; prevAmount: number }>;
  totalTx: number;
};

export async function getInsightAggregates(): Promise<InsightAggregates> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  const [current, previous, subs, total] = await Promise.all([
    prisma.transaction.findMany({ where: { occurredAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.transaction.findMany({ where: { occurredAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
    prisma.transaction.findMany({
      where: { category: "Подписки", occurredAt: { gte: monthStart, lte: monthEnd } },
      orderBy: { amount: "desc" },
    }),
    prisma.transaction.count(),
  ]);

  const expenses = current.filter((t) => t.type === "EXPENSE");
  const monthSpent = expenses.reduce((a, t) => a + Number(t.amount), 0);
  const monthIncome = current.filter((t) => t.type === "INCOME").reduce((a, t) => a + Number(t.amount), 0);

  const prevExpenses = previous.filter((t) => t.type === "EXPENSE");
  const prevMonthSpent = prevExpenses.reduce((a, t) => a + Number(t.amount), 0);

  const averageCheck = expenses.length > 0 ? monthSpent / expenses.length : 0;

  let weekdaySum = 0, weekdayCount = 0, weekendSum = 0, weekendCount = 0;
  for (const t of expenses) {
    const d = t.occurredAt.getDay();
    const amt = Number(t.amount);
    if (d === 0 || d === 6) {
      weekendSum += amt;
      weekendCount++;
    } else {
      weekdaySum += amt;
      weekdayCount++;
    }
  }
  const weekdayAvg = weekdayCount > 0 ? weekdaySum / weekdayCount : 0;
  const weekendAvg = weekendCount > 0 ? weekendSum / weekendCount : 0;

  const catMap = new Map<string, { amount: number; prevAmount: number }>();
  for (const c of CATEGORIES) catMap.set(c, { amount: 0, prevAmount: 0 });
  for (const t of expenses) {
    const b = catMap.get(normalizeCategory(t.category));
    if (b) b.amount += Number(t.amount);
  }
  for (const t of prevExpenses) {
    const b = catMap.get(normalizeCategory(t.category));
    if (b) b.prevAmount += Number(t.amount);
  }
  const categories = Array.from(catMap.entries())
    .map(([category, v]) => ({ category, ...v }))
    .filter((c) => c.amount > 0 || c.prevAmount > 0);

  return {
    monthSpent,
    monthIncome,
    prevMonthSpent,
    averageCheck,
    weekdayAvg,
    weekendAvg,
    subscriptions: subs.map((s) => ({ description: s.description, amount: Number(s.amount) })),
    categories,
    totalTx: total,
  };
}

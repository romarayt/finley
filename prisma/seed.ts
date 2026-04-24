import { PrismaClient, Prisma } from "@prisma/client";
import { subDays, subHours, startOfDay } from "date-fns";

const prisma = new PrismaClient();

type Seed = {
  description: string;
  amount: number;
  category: string;
  weight?: number;
};

const FOOD: Seed[] = [
  { description: "Магнит", amount: 2340, category: "Еда", weight: 2 },
  { description: "Перекрёсток", amount: 3180, category: "Еда", weight: 2 },
  { description: "Пятёрочка", amount: 1450, category: "Еда", weight: 2 },
  { description: "Кофе на вынос", amount: 320, category: "Еда", weight: 4 },
  { description: "Обед в офисе", amount: 680, category: "Еда", weight: 3 },
  { description: "Доставка еды", amount: 1420, category: "Еда", weight: 2 },
  { description: "Ресторан", amount: 4200, category: "Еда" },
  { description: "Кофейня", amount: 410, category: "Еда", weight: 2 },
  { description: "Вкусвилл", amount: 2860, category: "Еда" },
];

const TRANSPORT: Seed[] = [
  { description: "Yandex Go", amount: 480, category: "Транспорт", weight: 3 },
  { description: "Uber до работы", amount: 560, category: "Транспорт", weight: 2 },
  { description: "Метро", amount: 62, category: "Транспорт", weight: 2 },
  { description: "Заправка", amount: 3200, category: "Транспорт" },
  { description: "Каршеринг", amount: 720, category: "Транспорт" },
];

const HOUSING: Seed[] = [
  { description: "Аренда квартиры", amount: 65000, category: "Жильё" },
  { description: "Коммуналка", amount: 4800, category: "Жильё" },
];

const FUN: Seed[] = [
  { description: "Билет в кино", amount: 720, category: "Развлечения" },
  { description: "Концерт", amount: 3500, category: "Развлечения" },
  { description: "Бар с друзьями", amount: 2600, category: "Развлечения" },
  { description: "Steam — игра", amount: 1490, category: "Развлечения" },
];

const SUBS: Seed[] = [
  { description: "Netflix подписка", amount: 799, category: "Подписки" },
  { description: "Spotify", amount: 299, category: "Подписки" },
  { description: "iCloud 200GB", amount: 229, category: "Подписки" },
  { description: "Яндекс Плюс", amount: 399, category: "Подписки" },
];

const SHOPPING: Seed[] = [
  { description: "Wildberries — заказ", amount: 2340, category: "Шоппинг" },
  { description: "Ozon", amount: 1890, category: "Шоппинг" },
  { description: "Одежда", amount: 5400, category: "Шоппинг" },
  { description: "Электроника", amount: 8900, category: "Шоппинг" },
];

const HEALTH: Seed[] = [
  { description: "Аптека", amount: 860, category: "Здоровье" },
  { description: "Приём у врача", amount: 2800, category: "Здоровье" },
];

const WORK: Seed[] = [
  { description: "Рабочая канцелярия", amount: 420, category: "Работа" },
  { description: "Coworking день", amount: 900, category: "Работа" },
];

const EDU: Seed[] = [{ description: "Онлайн-курс", amount: 2900, category: "Образование" }];

const OTHER: Seed[] = [
  { description: "Подарок", amount: 1800, category: "Другое" },
  { description: "Благотворительность", amount: 500, category: "Другое" },
];

function expand(seeds: Seed[]): Seed[] {
  return seeds.flatMap((s) => Array.from({ length: s.weight ?? 1 }, () => s));
}

function pick<T>(arr: T[]): T {
  const value = arr[Math.floor(Math.random() * arr.length)];
  if (value === undefined) throw new Error("empty array");
  return value;
}

function jitter(amount: number): number {
  const factor = 0.85 + Math.random() * 0.3;
  return Math.round(amount * factor);
}

type PlannedTx = {
  description: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  occurredAt: Date;
};

function plan(): PlannedTx[] {
  const now = new Date();

  const buckets: { pool: Seed[]; count: number }[] = [
    { pool: expand(FOOD), count: 15 },
    { pool: expand(TRANSPORT), count: 7 },
    { pool: expand(HOUSING), count: 2 },
    { pool: expand(FUN), count: 5 },
    { pool: expand(SUBS), count: 4 },
    { pool: expand(SHOPPING), count: 5 },
    { pool: expand(HEALTH), count: 2 },
    { pool: expand(WORK), count: 2 },
    { pool: expand(EDU), count: 1 },
    { pool: expand(OTHER), count: 2 },
  ];

  const tx: PlannedTx[] = [];

  for (const { pool, count } of buckets) {
    for (let i = 0; i < count; i++) {
      const seed = pick(pool);
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 14) + 7;
      const occurredAt = subHours(startOfDay(subDays(now, daysAgo)), -hoursAgo);
      tx.push({
        description: seed.description,
        amount: jitter(seed.amount),
        category: seed.category,
        type: "EXPENSE",
        occurredAt,
      });
    }
  }

  tx.push({
    description: "Зарплата",
    amount: 150000,
    category: "Работа",
    type: "INCOME",
    occurredAt: subDays(now, 5),
  });
  tx.push({
    description: "Зарплата аванс",
    amount: 60000,
    category: "Работа",
    type: "INCOME",
    occurredAt: subDays(now, 20),
  });
  tx.push({
    description: "Фриланс проект",
    amount: 28000,
    category: "Работа",
    type: "INCOME",
    occurredAt: subDays(now, 12),
  });

  return tx.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

async function main() {
  console.log("[seed] clearing existing data...");
  await prisma.transaction.deleteMany();
  await prisma.correction.deleteMany();
  await prisma.insightCache.deleteMany();

  console.log("[seed] upserting settings...");
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, monthlyBudget: new Prisma.Decimal(80000), currency: "RUB" },
    update: { monthlyBudget: new Prisma.Decimal(80000), currency: "RUB" },
  });

  const planned = plan();
  console.log(`[seed] inserting ${planned.length} transactions...`);
  for (const t of planned) {
    await prisma.transaction.create({
      data: {
        description: t.description,
        amount: new Prisma.Decimal(t.amount),
        currency: "RUB",
        category: t.category,
        type: t.type,
        occurredAt: t.occurredAt,
      },
    });
  }

  console.log("[seed] done ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

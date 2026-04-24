# Finley — AI-трекер финансов

Персональный трекер расходов с AI-категоризацией. Пишешь одной фразой
(«потратил 1200 на обед с Никой») — Finley распарсит сумму, категорию,
описание и добавит транзакцию. На дашборде видно, укладываешься ли в бюджет
в этом месяце. Раздел Insights раз в 6 часов пересобирает текстовые
наблюдения о твоих тратах.

## Стек

- Next.js 14 App Router · TypeScript strict · Tailwind + CSS variables
- Prisma 6 + PostgreSQL (Neon serverless)
- OpenAI `gpt-4o-mini` для категоризации и инсайтов (Structured Outputs)
- Recharts, Framer Motion, shadcn/radix primitives
- Single-user password gate через Edge middleware (HMAC-signed cookie)

## Локальный запуск

1. Создай бесплатный проект на [neon.tech](https://neon.tech), получи две
   connection-строки: pooled (для рантайма) и unpooled (для миграций).
2. Заполни `.env.local` (шаблон в `.env.example`):
   ```
   DATABASE_URL=...          # pooled Neon URL
   DIRECT_URL=...            # unpooled Neon URL
   OPENAI_API_KEY=sk-...
   APP_PASSWORD=...          # любой пароль
   SESSION_SECRET=...        # openssl rand -hex 32
   ```
3. Установи и проинициализируй БД:
   ```
   npm install
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```
4. Открой http://localhost:3000, введи `APP_PASSWORD`.

## Полезные команды

- `npm run dev` — dev-сервер
- `npm run build && npm start` — продакшн-сборка локально
- `npm run seed` — залить 50 реалистичных транзакций за последние 30 дней
- `npm run db:studio` — Prisma Studio
- `npm run db:migrate` — создать миграцию

## Деплой на Vercel

1. Запушь в GitHub: `gh repo create <name> --public --source . --push`.
2. `npm i -g vercel && vercel link` (браузерная авторизация).
3. Перенеси все 5 env-переменных (`vercel env add ...`) для
   `production` и `preview`.
4. `vercel --prod`.
5. Применить миграции на prod БД:
   ```
   DATABASE_URL=<prod> DIRECT_URL=<prod-direct> npx prisma migrate deploy
   ```
6. Залить seed на prod (осознанно, один раз):
   ```
   DATABASE_URL=<prod> DIRECT_URL=<prod-direct> npm run seed
   ```

## Структура

```
app/                 роуты (Server Components где возможно)
  api/               эндпоинты — auth, transactions, categorize, insights, export
features/            бизнес-логика по фичам
  ai/                промпты, zod-схемы, OpenAI-клиент
  categories/        каталог 10 категорий с иконками и цветами
  dashboard/         hero card, bento, charts
  transactions/      QuickAdd, History, EditDialog, CategoryBadge
  insights/          AI-генератор + карточки
  settings/          форма + экспорт + danger zone
  export/            CSV/PDF рендеринг
components/ui/       примитивы (button, card, dialog, …)
components/layout/   shell, sidebar, bottom nav, floating add
lib/                 db, env, session, money, date, aggregates
prisma/              schema + seed
```

## Дизайн-система (в двух словах)

- **Типографика:** Lora (headings), Geist Sans (body), Geist Mono (numbers).
  Суммы всегда `font-mono tabular-nums`.
- **Spacing:** только 4/8 px множители.
- **Цвета:** 60/30/10 background/surface/primary. Семантические цвета
  зарезервированы: success для доходов, warning для 80% бюджета, danger
  только для превышения и ошибок.
- **Radii:** sm 4 / md 8 / lg 12 / 2xl 16 / full.
- **Анимации** только осмысленные: count-up на hero-цифре, slide-up на
  модалках, shimmer на skeletons.

## Лицензия

Приватный pet-project, код — личное пользование.

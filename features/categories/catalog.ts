import {
  Utensils,
  Car,
  Home,
  Film,
  Stethoscope,
  Briefcase,
  Repeat,
  ShoppingBag,
  GraduationCap,
  Package,
  type LucideIcon,
} from "lucide-react";

export const CATEGORIES = [
  "Еда",
  "Транспорт",
  "Жильё",
  "Развлечения",
  "Здоровье",
  "Работа",
  "Подписки",
  "Шоппинг",
  "Образование",
  "Другое",
] as const;

export type Category = (typeof CATEGORIES)[number];

type Meta = {
  icon: LucideIcon;
  colorVar: string;
  hex: string;
};

export const CATEGORY_META: Record<Category, Meta> = {
  "Еда": { icon: Utensils, colorVar: "cat-food", hex: "hsl(24 85% 55%)" },
  "Транспорт": { icon: Car, colorVar: "cat-transport", hex: "hsl(212 80% 52%)" },
  "Жильё": { icon: Home, colorVar: "cat-housing", hex: "hsl(262 60% 55%)" },
  "Развлечения": { icon: Film, colorVar: "cat-fun", hex: "hsl(330 75% 58%)" },
  "Здоровье": { icon: Stethoscope, colorVar: "cat-health", hex: "hsl(160 65% 42%)" },
  "Работа": { icon: Briefcase, colorVar: "cat-work", hex: "hsl(220 10% 40%)" },
  "Подписки": { icon: Repeat, colorVar: "cat-subs", hex: "hsl(280 60% 58%)" },
  "Шоппинг": { icon: ShoppingBag, colorVar: "cat-shopping", hex: "hsl(340 70% 55%)" },
  "Образование": { icon: GraduationCap, colorVar: "cat-education", hex: "hsl(45 90% 50%)" },
  "Другое": { icon: Package, colorVar: "cat-other", hex: "hsl(240 5% 60%)" },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function normalizeCategory(value: string): Category {
  return isCategory(value) ? value : "Другое";
}

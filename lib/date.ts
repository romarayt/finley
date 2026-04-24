import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";

export function groupByDay<T extends { occurredAt: Date }>(items: T[]): Array<{ day: Date; items: T[] }> {
  const map = new Map<number, { day: Date; items: T[] }>();
  for (const item of items) {
    const day = startOfDay(item.occurredAt);
    const key = day.getTime();
    const bucket = map.get(key);
    if (bucket) bucket.items.push(item);
    else map.set(key, { day, items: [item] });
  }
  return Array.from(map.values()).sort((a, b) => b.day.getTime() - a.day.getTime());
}

export function formatDayHeader(day: Date): string {
  if (isToday(day)) return "Сегодня";
  if (isYesterday(day)) return "Вчера";
  return format(day, "d MMMM, EEEE", { locale: ru });
}

export function formatShortDate(date: Date): string {
  return format(date, "d MMM", { locale: ru });
}

export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

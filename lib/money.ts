export type Currency = "RUB" | "USD" | "EUR";

const SYMBOLS: Record<Currency, string> = {
  RUB: "₽",
  USD: "$",
  EUR: "€",
};

export function formatMoney(
  value: number | string,
  currency: Currency = "RUB",
  opts: { compact?: boolean; sign?: boolean } = {}
): string {
  const n = typeof value === "string" ? Number(value) : value;
  const abs = Math.abs(n);

  if (opts.compact && abs >= 1000) {
    const units = [
      { v: 1_000_000_000, s: "млрд" },
      { v: 1_000_000, s: "млн" },
      { v: 1_000, s: "тыс" },
    ];
    for (const u of units) {
      if (abs >= u.v) {
        const short = (n / u.v).toFixed(abs >= u.v * 10 ? 0 : 1);
        return `${short} ${u.s} ${SYMBOLS[currency]}`;
      }
    }
  }

  const formatter = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: abs < 100 && abs % 1 !== 0 ? 2 : 0,
  });
  const formatted = formatter.format(Math.abs(n));
  const prefix = opts.sign && n !== 0 ? (n > 0 ? "+" : "−") : n < 0 ? "−" : "";
  return `${prefix}${formatted} ${SYMBOLS[currency]}`;
}

export function currencySymbol(currency: Currency): string {
  return SYMBOLS[currency];
}

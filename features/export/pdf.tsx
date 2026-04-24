import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { Transaction } from "@prisma/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.5/files/roboto-cyrillic-400-normal.woff", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.5/files/roboto-cyrillic-700-normal.woff", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Roboto", fontSize: 10, color: "#1a1a1f" },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b6b73", marginBottom: 24 },
  summary: { flexDirection: "row", gap: 16, marginBottom: 24 },
  summaryItem: { flex: 1, borderWidth: 1, borderColor: "#e3e3e8", borderRadius: 8, padding: 12 },
  summaryLabel: { fontSize: 8, color: "#6b6b73", marginBottom: 4, textTransform: "uppercase" },
  summaryValue: { fontSize: 14, fontWeight: 700 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1a1a1f", paddingBottom: 6, marginBottom: 6 },
  tableRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#e3e3e8" },
  colDate: { width: "18%" },
  colCat: { width: "20%" },
  colDesc: { width: "42%" },
  colAmount: { width: "20%", textAlign: "right" },
  small: { fontSize: 9, color: "#6b6b73" },
  income: { color: "#2a7f3f" },
  expense: { color: "#1a1a1f" },
});

export function ReportDocument({
  txns,
  from,
  to,
  monthSpent,
  monthIncome,
  currency,
}: {
  txns: Transaction[];
  from: Date;
  to: Date;
  monthSpent: number;
  monthIncome: number;
  currency: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Finley — отчёт</Text>
        <Text style={styles.subtitle}>
          Период: {format(from, "d MMMM yyyy", { locale: ru })} — {format(to, "d MMMM yyyy", { locale: ru })}
        </Text>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Всего транзакций</Text>
            <Text style={styles.summaryValue}>{txns.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Доходы</Text>
            <Text style={[styles.summaryValue, styles.income]}>
              {monthIncome.toLocaleString("ru-RU")} {currency}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Расходы</Text>
            <Text style={styles.summaryValue}>
              {monthSpent.toLocaleString("ru-RU")} {currency}
            </Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.colDate, { fontWeight: 700 }]}>Дата</Text>
          <Text style={[styles.colCat, { fontWeight: 700 }]}>Категория</Text>
          <Text style={[styles.colDesc, { fontWeight: 700 }]}>Описание</Text>
          <Text style={[styles.colAmount, { fontWeight: 700 }]}>Сумма</Text>
        </View>

        {txns.map((t) => (
          <View key={t.id} style={styles.tableRow} wrap={false}>
            <Text style={styles.colDate}>{format(t.occurredAt, "d MMM", { locale: ru })}</Text>
            <Text style={styles.colCat}>{t.category}</Text>
            <Text style={styles.colDesc}>{t.description}</Text>
            <Text style={[styles.colAmount, t.type === "INCOME" ? styles.income : styles.expense]}>
              {t.type === "INCOME" ? "+" : "−"}
              {Number(t.amount).toLocaleString("ru-RU")} {t.currency}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

import type { PaymentStatus, PeriodStatus } from "./types"

/**
 * The demo is anchored to a fixed "today" so the seeded overdue counts stay
 * meaningful no matter when the demo is opened. Change this one constant to
 * re-anchor the whole dataset.
 */
export const DEMO_TODAY = new Date("2026-08-17T00:00:00Z")

const currency = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
})

const compactCurrency = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  notation: "compact",
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const MONTH_NAMES = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
]

export function formatCurrency(value: number) {
  return currency.format(value)
}

export function formatCompactCurrency(value: number) {
  return compactCurrency.format(value)
}

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

/** "2026-07" → "יולי" */
export function formatPeriod(period: string) {
  const month = Number(period.slice(5, 7))
  return MONTH_NAMES[month - 1] ?? period
}

/** "2026-07" → "יולי 2026" */
export function formatPeriodLong(period: string) {
  return `${formatPeriod(period)} ${period.slice(0, 4)}`
}

/** Days past dueDate as of DEMO_TODAY. Never negative. */
export function daysOverdue(dueDate: string, now: Date = DEMO_TODAY) {
  const diff = now.getTime() - new Date(dueDate).getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}

export function balanceOf(charge: { amount: number; paidAmount: number }) {
  return Math.max(0, charge.amount - charge.paidAmount)
}

/**
 * Maps a status onto the semantic chart palette defined in globals.css, so the
 * table badges, the donut and the bars all agree on what "overdue" looks like.
 */
export const PAYMENT_STATUS_CHART_VAR: Record<PaymentStatus, string> = {
  שולם: "var(--chart-1)",
  "נשלחה דרישה": "var(--chart-2)",
  "טרם שולם": "var(--chart-3)",
  באיחור: "var(--chart-4)",
}

export const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
  שולם: "border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]",
  "נשלחה דרישה":
    "border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]",
  "טרם שולם": "border-transparent bg-[var(--chart-3)]/20 text-[var(--chart-3)]",
  באיחור: "border-transparent bg-[var(--chart-4)]/15 text-[var(--chart-4)]",
}

export const PERIOD_STATUS_CLASSES: Record<PeriodStatus, string> = {
  הוגש: "border-transparent bg-[var(--chart-1)]/15 text-[var(--chart-1)]",
  בטיפול: "border-transparent bg-[var(--chart-2)]/15 text-[var(--chart-2)]",
  "ממתין לחומרים":
    "border-transparent bg-[var(--chart-3)]/20 text-[var(--chart-3)]",
}

/** Left border accent on a table row, by how late the payment is. */
export function overdueAccentClass(days: number) {
  if (days >= 60) return "border-s-4 border-s-[var(--chart-4)]"
  if (days >= 30) return "border-s-4 border-s-[var(--chart-4)]/60"
  if (days > 0) return "border-s-4 border-s-[var(--chart-3)]"
  return "border-s-4 border-s-transparent"
}

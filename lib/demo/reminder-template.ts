import { formatCurrency, formatDate, formatPeriodLong } from "./format"
import type { ReminderKind } from "./types"

export interface ReminderInput {
  clientName: string
  businessName: string
  amount: number
  dueDate: string
  period: string
  daysOverdue: number
  invoiceNumber: string
  missingDocs: string[]
  kind: ReminderKind
}

/**
 * Deterministic fallback used whenever the AI call fails or is slow. A live
 * API error in front of the client is the single riskiest moment in the demo,
 * so the UI always has something correct to show.
 */
export function templateReminder(input: ReminderInput): string {
  const amount = formatCurrency(input.amount)
  const due = formatDate(input.dueDate)
  const period = formatPeriodLong(input.period)

  switch (input.kind) {
    case "דרישת תשלום ראשונית":
      return `שלום ${input.clientName}, מצורפת דרישת תשלום עבור שירותי הנהלת החשבונות לתקופת ${period} על סך ${amount} (חשבונית ${input.invoiceNumber}). מועד התשלום הוא ${due}. אשמח לאישור קבלה, ואם יש שאלה כלשהי אני כאן. תודה רבה!`

    case "תזכורת תשלום":
      return `היי ${input.clientName}, רק תזכורת ידידותית שהתשלום עבור ${period} על סך ${amount} טרם התקבל אצלנו (מועד היעד היה ${due}). אשמח אם תוכל/י להסדיר בימים הקרובים. תודה!`

    case "התראה לפני פיגור":
      return `שלום ${input.clientName}, החשבונית עבור ${period} על סך ${amount} נמצאת בפיגור של ${input.daysOverdue} ימים ממועד היעד ${due}. אבקש להסדיר את התשלום עד סוף השבוע כדי שנוכל להמשיך בטיפול השוטף בתיק. אשמח לחזור אליך אם נדרשת פריסה. תודה.`

    case "בקשת חומרים חסרים":
      return `היי ${input.clientName}, כדי שאוכל להשלים את הדיווח עבור ${period} חסרים לי המסמכים הבאים: ${input.missingDocs.join(", ")}. אפשר לשלוח אותם כאן בוואטסאפ או במייל, מה שנוח לך. תודה רבה!`
  }
}

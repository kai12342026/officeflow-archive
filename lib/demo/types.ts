export const BUSINESS_TYPES = ["עוסק מורשה", "עוסק פטור"] as const
export type BusinessType = (typeof BUSINESS_TYPES)[number]

export const REPORTING_CYCLES = ["חודשי", "דו-חודשי"] as const
export type ReportingCycle = (typeof REPORTING_CYCLES)[number]

export const PAYMENT_STATUSES = [
  "שולם",
  "נשלחה דרישה",
  "טרם שולם",
  "באיחור",
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PERIOD_STATUSES = ["הוגש", "בטיפול", "ממתין לחומרים"] as const
export type PeriodStatus = (typeof PERIOD_STATUSES)[number]

export interface Charge {
  id: string
  clientId: string
  /** ISO year-month, e.g. "2026-07". */
  period: string
  amount: number
  paidAmount: number
  /** ISO date. */
  dueDate: string
  status: PaymentStatus
  invoiceNumber: string
}

export interface Client {
  id: string
  name: string
  businessName: string
  businessType: BusinessType
  /** מספר עוסק */
  taxId: string
  phone: string
  email: string
  reportingCycle: ReportingCycle
  monthlyFee: number
  /** ISO date. */
  joinedAt: string
  notes?: string
  periodStatus: PeriodStatus
  missingDocs: string[]
  /** Freeform key/value pairs — stands in for the custom-fields feature. */
  customFields: { label: string; value: string }[]
  charges: Charge[]
}

/** The four things the AI message generator can be asked to write. */
export const REMINDER_KINDS = [
  "דרישת תשלום ראשונית",
  "תזכורת תשלום",
  "התראה לפני פיגור",
  "בקשת חומרים חסרים",
] as const
export type ReminderKind = (typeof REMINDER_KINDS)[number]

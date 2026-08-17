import { DEMO_TODAY } from "./format"
import type {
  BusinessType,
  Charge,
  Client,
  PaymentStatus,
  PeriodStatus,
  ReportingCycle,
} from "./types"

/**
 * ---------------------------------------------------------------------------
 * DEMO DATA — invented, for presentation only.
 *
 * None of this is real client information. It is shaped to look like a real
 * working month for a solo accounting practice: mostly-settled retainers, a
 * handful of genuine debtors at different depths, and a few files stuck waiting
 * on paperwork. When the real Excel arrives, this file is replaced by Supabase
 * tables and nothing else in the app has to change.
 * ---------------------------------------------------------------------------
 */

const MONTHLY_PERIODS = [
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
]
const BIMONTHLY_PERIODS = ["2026-04", "2026-06", "2026-08"]

interface Seed {
  id: string
  name: string
  businessName: string
  businessType: BusinessType
  taxId: string
  phone: string
  email: string
  reportingCycle: ReportingCycle
  monthlyFee: number
  joinedAt: string
  /** Day of the following month the invoice falls due. */
  dueDay: number
  periodStatus: PeriodStatus
  notes?: string
  missingDocs?: string[]
  customFields?: { label: string; value: string }[]
  /** First period still open. Everything before it is settled in full. */
  unpaidFrom: string
  /** Periods where a payment demand has already gone out. */
  requested?: string[]
  /** Partial payment sitting on the `unpaidFrom` charge. */
  partialPaid?: number
}

const SEEDS: Seed[] = [
  {
    id: "c01",
    name: "יעל בן-שמעון",
    businessName: 'מספרת "ראש טוב"',
    businessType: "עוסק מורשה",
    taxId: "514832907",
    phone: "0524418902",
    email: "yael@roshtov.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 890,
    joinedAt: "2023-02-01",
    dueDay: 15,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "4" },
      { label: "תוכנת חשבוניות", value: "מורנינג" },
    ],
  },
  {
    id: "c02",
    name: "רונן אזולאי",
    businessName: "רונן אזולאי — חשמלאי מוסמך",
    businessType: "עוסק מורשה",
    taxId: "038219476",
    phone: "0507730164",
    email: "ronen.azulay.electric@gmail.com",
    reportingCycle: "חודשי",
    monthlyFee: 650,
    joinedAt: "2021-09-15",
    dueDay: 17,
    periodStatus: "בטיפול",
    notes: "מעדיף תזכורות בוואטסאפ, לא במייל.",
    unpaidFrom: "2026-05",
    requested: ["2026-05", "2026-06"],
    customFields: [
      { label: "מספר עובדים", value: "1" },
      { label: "תוכנת חשבוניות", value: "iCount" },
    ],
  },
  {
    id: "c03",
    name: 'ד"ר נועם ברזילי',
    businessName: "קליניקת שיניים ד״ר ברזילי",
    businessType: "עוסק מורשה",
    taxId: "515901238",
    phone: "0546621730",
    email: "office@barzilay-dental.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 2400,
    joinedAt: "2020-04-01",
    dueDay: 10,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "6" },
      { label: "תוכנת חשבוניות", value: "חשבשבת" },
    ],
  },
  {
    id: "c04",
    name: "מיכל דגן",
    businessName: "מיכל דגן — ייעוץ עסקי",
    businessType: "עוסק פטור",
    taxId: "029384715",
    phone: "0523390845",
    email: "michal@dagan-consulting.com",
    reportingCycle: "דו-חודשי",
    monthlyFee: 480,
    joinedAt: "2024-01-10",
    dueDay: 20,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [{ label: "תוכנת חשבוניות", value: "סאמיט" }],
  },
  {
    id: "c05",
    name: "אבי אבוחצירא",
    businessName: "מוסך אבוחצירא ובניו",
    businessType: "עוסק מורשה",
    taxId: "512773094",
    phone: "0508841127",
    email: "avi@abuhatzira-garage.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 1750,
    joinedAt: "2019-06-01",
    dueDay: 5,
    periodStatus: "ממתין לחומרים",
    notes: "שולח חשבוניות בצילום מסך בוואטסאפ, לרוב באיחור.",
    missingDocs: [
      "חשבוניות ספקים 07/2026",
      "דפי בנק 07/2026",
      "אישור ניכוי מס במקור",
    ],
    unpaidFrom: "2026-06",
    requested: ["2026-06"],
    customFields: [
      { label: "מספר עובדים", value: "5" },
      { label: "תוכנת חשבוניות", value: "רווחית" },
    ],
  },
  {
    id: "c06",
    name: "שירה לוינסון",
    businessName: 'סטודיו פילאטיס "בתנועה"',
    businessType: "עוסק מורשה",
    taxId: "516204881",
    phone: "0545512207",
    email: "shira@betnua-studio.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 1150,
    joinedAt: "2022-11-01",
    dueDay: 15,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "3" },
      { label: "תוכנת חשבוניות", value: "מורנינג" },
    ],
  },
  {
    id: "c07",
    name: "עומר פרץ",
    businessName: "עומר פרץ — צילום אירועים",
    businessType: "עוסק מורשה",
    taxId: "034471928",
    phone: "0526674410",
    email: "omer@omerperetz.photo",
    reportingCycle: "דו-חודשי",
    monthlyFee: 720,
    joinedAt: "2023-07-20",
    dueDay: 25,
    periodStatus: "בטיפול",
    unpaidFrom: "2026-06",
    partialPaid: 600,
    customFields: [{ label: "תוכנת חשבוניות", value: "iCount" }],
  },
  {
    id: "c08",
    name: "לילך מזרחי",
    businessName: 'בוטיק "לילך"',
    businessType: "עוסק מורשה",
    taxId: "513668402",
    phone: "0503327719",
    email: "lilach@lilach-boutique.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 980,
    joinedAt: "2021-03-01",
    dueDay: 10,
    periodStatus: "הוגש",
    unpaidFrom: "2026-07",
    customFields: [
      { label: "מספר עובדים", value: "2" },
      { label: "תוכנת חשבוניות", value: "מורנינג" },
    ],
  },
  {
    id: "c09",
    name: "טל גרינברג",
    businessName: 'סטודיו "פיקסל" — עיצוב גרפי',
    businessType: "עוסק מורשה",
    taxId: "515773660",
    phone: "0549982301",
    email: "tal@pixel-studio.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 1320,
    joinedAt: "2022-05-15",
    dueDay: 15,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "3" },
      { label: "תוכנת חשבוניות", value: "סאמיט" },
    ],
  },
  {
    id: "c10",
    name: "דניאל עמר",
    businessName: "דניאל עמר — אימון אישי",
    businessType: "עוסק פטור",
    taxId: "031882045",
    phone: "0587741220",
    email: "daniel.amar.fit@gmail.com",
    reportingCycle: "דו-חודשי",
    monthlyFee: 450,
    joinedAt: "2024-09-01",
    dueDay: 20,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [{ label: "תוכנת חשבוניות", value: "ללא — קבלות ידניות" }],
  },
  {
    id: "c11",
    name: "אורי שגב",
    businessName: 'בית קפה "נעים"',
    businessType: "עוסק מורשה",
    taxId: "514009822",
    phone: "0521145038",
    email: "uri@naim-cafe.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 1580,
    joinedAt: "2020-10-01",
    dueDay: 5,
    periodStatus: "הוגש",
    unpaidFrom: "2026-07",
    requested: ["2026-07"],
    customFields: [
      { label: "מספר עובדים", value: "8" },
      { label: "תוכנת חשבוניות", value: "רווחית" },
    ],
  },
  {
    id: "c12",
    name: "שרון כהן",
    businessName: "שרון כהן — הוראה פרטית",
    businessType: "עוסק פטור",
    taxId: "027716340",
    phone: "0544428816",
    email: "sharon.cohen.math@gmail.com",
    reportingCycle: "דו-חודשי",
    monthlyFee: 420,
    joinedAt: "2025-02-01",
    dueDay: 20,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [{ label: "תוכנת חשבוניות", value: "ללא — קבלות ידניות" }],
  },
  {
    id: "c13",
    name: "יוסי מלכה",
    businessName: '"בנייה ירוקה" — שיפוצים וקבלנות',
    businessType: "עוסק מורשה",
    taxId: "512004773",
    phone: "0505563401",
    email: "yossi@green-build.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 2800,
    joinedAt: "2018-01-15",
    dueDay: 25,
    periodStatus: "ממתין לחומרים",
    notes: "תיק גדול. דורש תשומת לב מיוחדת לקיזוזי מע״מ על תשומות.",
    missingDocs: ["חשבוניות קבלני משנה 07/2026", "דוח אשראי 07/2026"],
    unpaidFrom: "2026-06",
    requested: ["2026-06"],
    customFields: [
      { label: "מספר עובדים", value: "12" },
      { label: "תוכנת חשבוניות", value: "חשבשבת" },
    ],
  },
  {
    id: "c14",
    name: 'ד"ר איתי גל',
    businessName: 'וטרינריה "בשכונה"',
    businessType: "עוסק מורשה",
    taxId: "515338291",
    phone: "0546690012",
    email: "itay@vet-bashchuna.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 1420,
    joinedAt: "2022-08-01",
    dueDay: 15,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "3" },
      { label: "תוכנת חשבוניות", value: "מורנינג" },
    ],
  },
  {
    id: "c15",
    name: "נטלי חדד",
    businessName: '"טעם של פעם" — קייטרינג ביתי',
    businessType: "עוסק מורשה",
    taxId: "516882014",
    phone: "0528873155",
    email: "natalie@taam-shel-paam.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 1050,
    joinedAt: "2023-04-01",
    dueDay: 10,
    periodStatus: "ממתין לחומרים",
    missingDocs: ["חשבוניות ספקי מזון 07/2026", "טופס 856"],
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "4" },
      { label: "תוכנת חשבוניות", value: "iCount" },
    ],
  },
  {
    id: "c16",
    name: "אלכס פרידמן",
    businessName: '"טכנוליין" — מחשבים ותיקונים',
    businessType: "עוסק מורשה",
    taxId: "514557028",
    phone: "0501192274",
    email: "alex@technoline.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 1180,
    joinedAt: "2021-11-01",
    dueDay: 15,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "2" },
      { label: "תוכנת חשבוניות", value: "סאמיט" },
    ],
  },
  {
    id: "c17",
    name: "חן ביטון",
    businessName: 'משתלת "פרח בר"',
    businessType: "עוסק מורשה",
    taxId: "513220947",
    phone: "0527764490",
    email: "chen@perachbar.co.il",
    reportingCycle: "דו-חודשי",
    monthlyFee: 830,
    joinedAt: "2023-01-01",
    dueDay: 20,
    periodStatus: "הוגש",
    unpaidFrom: "2026-08",
    customFields: [
      { label: "מספר עובדים", value: "2" },
      { label: "תוכנת חשבוניות", value: "מורנינג" },
    ],
  },
  {
    id: "c18",
    name: "הדר נחמיאס",
    businessName: 'אולם אירועים "הדר"',
    businessType: "עוסק מורשה",
    taxId: "512889106",
    phone: "0523318870",
    email: "hadar@hadar-events.co.il",
    reportingCycle: "חודשי",
    monthlyFee: 2650,
    joinedAt: "2019-03-01",
    dueDay: 15,
    periodStatus: "בטיפול",
    unpaidFrom: "2026-07",
    customFields: [
      { label: "מספר עובדים", value: "15" },
      { label: "תוכנת חשבוניות", value: "חשבשבת" },
    ],
  },
]

/** "2026-07" + dueDay 10 → "2026-08-10" */
function dueDateFor(period: string, dueDay: number) {
  const year = Number(period.slice(0, 4))
  const month = Number(period.slice(5, 7))
  const due = new Date(Date.UTC(year, month, dueDay))
  return due.toISOString().slice(0, 10)
}

function statusFor(
  paidInFull: boolean,
  dueDate: string,
  wasRequested: boolean
): PaymentStatus {
  if (paidInFull) return "שולם"
  const isPastDue = DEMO_TODAY.getTime() > new Date(dueDate).getTime()
  if (wasRequested) return "נשלחה דרישה"
  return isPastDue ? "באיחור" : "טרם שולם"
}

let invoiceCounter = 1000

function buildCharges(seed: Seed): Charge[] {
  const periods =
    seed.reportingCycle === "חודשי" ? MONTHLY_PERIODS : BIMONTHLY_PERIODS
  const amount =
    seed.reportingCycle === "חודשי" ? seed.monthlyFee : seed.monthlyFee * 2

  return periods.map((period) => {
    const dueDate = dueDateFor(period, seed.dueDay)
    const isOpen = period >= seed.unpaidFrom
    const isFirstOpen = period === seed.unpaidFrom

    const paidAmount = isOpen
      ? isFirstOpen && seed.partialPaid
        ? seed.partialPaid
        : 0
      : amount

    return {
      id: `${seed.id}-${period}`,
      clientId: seed.id,
      period,
      amount,
      paidAmount,
      dueDate,
      status: statusFor(
        paidAmount >= amount,
        dueDate,
        seed.requested?.includes(period) ?? false
      ),
      invoiceNumber: `INV-${period.slice(0, 4)}-${++invoiceCounter}`,
    }
  })
}

export const DEMO_CLIENTS: Client[] = SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  businessName: seed.businessName,
  businessType: seed.businessType,
  taxId: seed.taxId,
  phone: seed.phone,
  email: seed.email,
  reportingCycle: seed.reportingCycle,
  monthlyFee: seed.monthlyFee,
  joinedAt: seed.joinedAt,
  notes: seed.notes,
  periodStatus: seed.periodStatus,
  missingDocs: seed.missingDocs ?? [],
  customFields: seed.customFields ?? [],
  charges: buildCharges(seed),
}))

/** Periods shown on the dashboard trend chart, oldest first. */
export const CHART_PERIODS = MONTHLY_PERIODS

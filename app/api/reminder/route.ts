import { APICallError, generateText } from "ai"

import { formatCurrency, formatDate, formatPeriodLong } from "@/lib/demo/format"
import {
  templateReminder,
  type ReminderInput,
} from "@/lib/demo/reminder-template"
import { REMINDER_KINDS } from "@/lib/demo/types"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const SYSTEM_PROMPT = [
  "אתה עוזר אישי של משרד רואי חשבון עצמאי בישראל, וכותב הודעות WhatsApp ללקוחות המשרד.",
  "כתוב בעברית תקנית וזורמת, בפנייה ישירה ללקוח, קצר: 2 עד 4 משפטים, עד 60 מילים.",
  "אל תשתמש בכותרות, בתבליטים, באימוג'ים או בסימני Markdown.",
  "אל תמציא סכומים, תאריכים או פרטים שלא נמסרו לך במפורש.",
  "החזר אך ורק את גוף ההודעה עצמו — בלי הקדמה, בלי הסבר ובלי מרכאות עוטפות.",
].join(" ")

const TONE_BY_KIND: Record<string, string> = {
  "דרישת תשלום ראשונית":
    "ענייני, נעים ומקצועי. זו הפנייה הראשונה — אין עדיין איחור.",
  "תזכורת תשלום": "ידידותי ומכבד, בלי לחץ. מזכיר בעדינות שהתשלום טרם התקבל.",
  "התראה לפני פיגור":
    "עסקי, החלטי אך מנומס. מבהיר שיש פיגור ומבקש הסדרה בזמן קרוב, בלי לאיים.",
  "בקשת חומרים חסרים":
    "ידידותי ומסייע. מבקש את המסמכים החסרים ומקל על הלקוח לשלוח אותם.",
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const input = (await request.json()) as ReminderInput

  if (!REMINDER_KINDS.includes(input.kind)) {
    return Response.json({ error: "invalid_kind" }, { status: 400 })
  }

  const facts = [
    `שם הלקוח: ${input.clientName}`,
    `שם העסק: ${input.businessName}`,
    `תקופת הדיווח: ${formatPeriodLong(input.period)}`,
    `מספר חשבונית: ${input.invoiceNumber}`,
    `סכום לתשלום: ${formatCurrency(input.amount)}`,
    `מועד תשלום אחרון: ${formatDate(input.dueDate)}`,
    input.daysOverdue > 0
      ? `ימי פיגור נכון להיום: ${input.daysOverdue}`
      : "התשלום טרם הגיע למועד הפירעון",
    input.missingDocs.length > 0
      ? `מסמכים חסרים: ${input.missingDocs.join(", ")}`
      : null,
    `סוג הפנייה: ${input.kind}`,
    `סגנון נדרש: ${TONE_BY_KIND[input.kind]}`,
    input.kind === "בקשת חומרים חסרים"
      ? "אל תזכיר סכומים או תשלום בהודעה הזו — היא עוסקת רק בהשלמת מסמכים."
      : null,
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const { text } = await generateText({
      // Plain "provider/model" strings route through the Vercel AI Gateway.
      // Auth falls back to the OIDC token automatically when there is no key.
      model: "google/gemini-3.1-flash-lite",
      system: SYSTEM_PROMPT,
      prompt: facts,
      maxOutputTokens: 300,
      temperature: 0.7,
      providerOptions: {
        gateway: {
          models: ["anthropic/claude-haiku-4.5"],
        },
      },
    })

    const message = text.trim()
    if (!message) {
      return Response.json({
        message: templateReminder(input),
        source: "template",
      })
    }

    return Response.json({ message, source: "ai" })
  } catch (error) {
    // Never surface a gateway failure to the client — fall back silently.
    console.error(
      "reminder generation failed",
      APICallError.isInstance(error) ? error.statusCode : error
    )
    return Response.json({
      message: templateReminder(input),
      source: "template",
    })
  }
}

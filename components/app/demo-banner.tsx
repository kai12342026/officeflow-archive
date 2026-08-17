import { Info } from "lucide-react"

/**
 * Honesty strip. The client sees invented data during the demo, so the app says
 * so out loud — and says what replaces it.
 */
export function DemoBanner() {
  return (
    <div className="flex items-start gap-2.5 border-b bg-accent/60 px-4 py-2.5 text-xs leading-relaxed text-accent-foreground sm:px-6">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-semibold">מצב הדגמה — </span>
        כל הנתונים במסך הם נתוני דמה שהומצאו לצורך ההצגה בלבד. ברגע שנקבל את
        קובץ האקסל, נעלה את הנתונים האמיתיים לסביבה מאובטחת ומוצפנת (Supabase)
        ונמשיך משם — הממשק עצמו נשאר בדיוק כפי שהוא.
      </p>
    </div>
  )
}

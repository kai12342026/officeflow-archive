import Link from "next/link"
import { redirect } from "next/navigation"
import { ChartPie, FileUp, LayoutDashboard, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/server"

const HIGHLIGHTS = [
  {
    icon: LayoutDashboard,
    title: "לוח בקרה אחד לכל התיקים",
    body: "כל הלקוחות, הסטטוסים, תאריכי היעד והיתרות הפתוחות במסך אחד — במקום קובץ אקסל שמתעדכן ידנית.",
  },
  {
    icon: MessageCircle,
    title: "תזכורות שנכתבות לבד",
    body: "הודעת WhatsApp מנוסחת בעברית לפי גובה החוב וימי הפיגור, מוכנה להעתקה בלחיצה.",
  },
  {
    icon: FileUp,
    title: "מעקב חומרים חסרים",
    body: "כל תיק יודע אילו מסמכים עוד חסרים לו — ומי צריך תזכורת כדי שהדיווח ייסגר בזמן.",
  },
  {
    icon: ChartPie,
    title: "תמונה עסקית בזמן אמת",
    body: "חיוב מול גבייה, התפלגות החוב הפתוח ומי מהלקוחות דורש תשומת לב עכשיו.",
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <span className="text-sm font-semibold tracking-tight">OfficeFlow</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            כניסה למערכת
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-10 px-6 py-16">
        <div className="grid gap-4">
          <p className="text-sm font-medium text-primary">
            מערכת ניהול למשרד רואי חשבון
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            האקסל שלך, רק שהוא עובד בשבילך
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            ניהול לקוחות, מעקב גבייה, סטטוס טיפול תקופתי ותזכורות מנוסחות
            אוטומטית — הכול במקום אחד, בעברית, בלי הקלדה כפולה.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button nativeButton={false} render={<Link href="/login" />}>
              כניסה לדשבורד
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title}>
              <CardContent className="grid gap-2 p-5">
                <item.icon className="size-5 text-primary" />
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

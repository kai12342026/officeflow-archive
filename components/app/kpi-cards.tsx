"use client"

import { AlertTriangle, FileClock, TrendingUp, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/demo/format"
import type { Kpis } from "@/lib/demo/store"

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const cards = [
    {
      label: "סך חוב פתוח",
      value: formatCurrency(kpis.openTotal),
      hint: `מזה ${formatCurrency(kpis.overdueTotal)} בפיגור`,
      icon: Wallet,
      tone: "text-foreground",
    },
    {
      label: "נגבה בתקופה האחרונה",
      value: formatCurrency(kpis.collectedThisMonth),
      hint: "יולי–אוגוסט 2026",
      icon: TrendingUp,
      tone: "text-[var(--chart-1)]",
    },
    {
      label: "לקוחות בפיגור",
      value: String(kpis.overdueClients),
      hint: "דורשים פנייה יזומה",
      icon: AlertTriangle,
      tone: "text-[var(--chart-4)]",
    },
    {
      label: "ממתינים לחומרים",
      value: String(kpis.awaitingDocs),
      hint: "תיקים שתקועים עד לקבלת מסמכים",
      icon: FileClock,
      tone: "text-[var(--chart-3)]",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
              <span
                className={cn(
                  "font-mono text-2xl font-bold tabular-nums",
                  card.tone
                )}
              >
                {card.value}
              </span>
              <span className="text-xs text-muted-foreground">{card.hint}</span>
            </div>
            <card.icon className={cn("size-5 shrink-0", card.tone)} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, FileClock, Phone, Search } from "lucide-react"

import { AppHeader } from "@/components/app/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PERIOD_STATUS_CLASSES,
  balanceOf,
  formatCurrency,
} from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { PERIOD_STATUSES } from "@/lib/demo/types"

const ALL = "__all__"

export default function ClientsPage() {
  const { clients } = useDemo()
  const [query, setQuery] = React.useState("")
  const [periodFilter, setPeriodFilter] = React.useState<string>(ALL)

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return clients.filter((client) => {
      if (periodFilter !== ALL && client.periodStatus !== periodFilter) {
        return false
      }
      if (!needle) return true
      return (
        client.name.toLowerCase().includes(needle) ||
        client.businessName.toLowerCase().includes(needle) ||
        client.taxId.includes(needle)
      )
    })
  }, [clients, query, periodFilter])

  return (
    <>
      <AppHeader
        title="לקוחות"
        subtitle={`${clients.length} תיקים פעילים במשרד`}
      />

      <div className="grid gap-5 p-4 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-52 flex-1 sm:max-w-md">
            <Search className="inset-inline-start-2.5 pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש לקוח…"
              className="ps-9"
              aria-label="חיפוש לקוחות"
            />
          </div>
          <Select
            value={periodFilter}
            onValueChange={(v) => setPeriodFilter(v as string)}
          >
            <SelectTrigger className="min-w-44">
              {/* Base UI renders the raw value unless it is mapped explicitly. */}
              <SelectValue>
                {(value) => (value === ALL ? "כל סטטוסי הטיפול" : String(value))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>כל סטטוסי הטיפול</SelectItem>
              {PERIOD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            לא נמצאו לקוחות התואמים לחיפוש.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((client) => {
              const openBalance = client.charges.reduce(
                (sum, charge) => sum + balanceOf(charge),
                0
              )

              return (
                <Card key={client.id} className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid min-w-0 gap-1">
                        <h2 className="truncate font-semibold">
                          {client.businessName}
                        </h2>
                        <p className="truncate text-xs text-muted-foreground">
                          {client.name} · {client.businessType}
                        </p>
                      </div>
                      <Badge
                        className={PERIOD_STATUS_CLASSES[client.periodStatus]}
                      >
                        {client.periodStatus}
                      </Badge>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div className="grid gap-0.5">
                        <dt className="text-xs text-muted-foreground">
                          ריטיינר חודשי
                        </dt>
                        <dd className="font-mono tabular-nums">
                          {formatCurrency(client.monthlyFee)}
                        </dd>
                      </div>
                      <div className="grid gap-0.5">
                        <dt className="text-xs text-muted-foreground">
                          יתרה פתוחה
                        </dt>
                        <dd className="font-mono tabular-nums">
                          {formatCurrency(openBalance)}
                        </dd>
                      </div>
                      <div className="grid gap-0.5">
                        <dt className="text-xs text-muted-foreground">
                          מחזור דיווח
                        </dt>
                        <dd>{client.reportingCycle}</dd>
                      </div>
                      <div className="grid gap-0.5">
                        <dt className="text-xs text-muted-foreground">טלפון</dt>
                        <dd className="flex items-center gap-1 tabular-nums">
                          <Phone className="size-3 text-muted-foreground" />
                          <span dir="ltr">{client.phone}</span>
                        </dd>
                      </div>
                    </dl>

                    {client.missingDocs.length > 0 ? (
                      <p className="flex items-center gap-1.5 rounded-md bg-[var(--chart-3)]/15 px-2.5 py-1.5 text-xs text-[var(--chart-3)]">
                        <FileClock className="size-3.5 shrink-0" />
                        חסרים {client.missingDocs.length} מסמכים
                      </p>
                    ) : null}

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto w-full"
                      nativeButton={false}
                      render={<Link href={`/clients/${client.id}`} />}
                    >
                      פתח כרטיס לקוח
                      <ChevronLeft />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

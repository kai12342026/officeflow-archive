"use client"

import * as React from "react"
import Link from "next/link"
import { MessageCircle, Search } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  PAYMENT_STATUS_CLASSES,
  PERIOD_STATUS_CLASSES,
  formatCurrency,
  formatDate,
  formatPeriod,
  overdueAccentClass,
} from "@/lib/demo/format"
import { buildRows, useDemo } from "@/lib/demo/store"
import {
  BUSINESS_TYPES,
  PAYMENT_STATUSES,
  type Charge,
  type Client,
  type PaymentStatus,
} from "@/lib/demo/types"

const ALL = "__all__"

export function CollectionsTable({
  onReminder,
}: {
  onReminder: (client: Client, charge: Charge) => void
}) {
  const { clients, dispatch } = useDemo()
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL)
  const [typeFilter, setTypeFilter] = React.useState<string>(ALL)

  const rows = React.useMemo(() => buildRows(clients), [clients])

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter(({ client, charge }) => {
      if (statusFilter !== ALL && charge.status !== statusFilter) return false
      if (typeFilter !== ALL && client.businessType !== typeFilter) return false
      if (!needle) return true
      return (
        client.name.toLowerCase().includes(needle) ||
        client.businessName.toLowerCase().includes(needle) ||
        client.taxId.includes(needle)
      )
    })
  }, [rows, query, statusFilter, typeFilter])

  const filteredBalance = filtered.reduce((sum, row) => sum + row.balance, 0)

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle className="text-base">מעקב גבייה</CardTitle>
            <CardDescription>
              {filtered.length} מתוך {rows.length} לקוחות · יתרה פתוחה{" "}
              <span className="font-mono tabular-nums">
                {formatCurrency(filteredBalance)}
              </span>
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="inset-inline-start-2.5 pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש לפי שם, עסק או מספר עוסק…"
              className="ps-9"
              aria-label="חיפוש לקוחות"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as string)}
          >
            <SelectTrigger className="h-9 min-w-40">
              {/* Base UI renders the raw value unless it is mapped explicitly. */}
              <SelectValue>
                {(value) => (value === ALL ? "כל סטטוסי הגבייה" : String(value))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>כל סטטוסי הגבייה</SelectItem>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as string)}
          >
            <SelectTrigger className="h-9 min-w-36">
              <SelectValue>
                {(value) => (value === ALL ? "כל סוגי העוסק" : String(value))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>כל סוגי העוסק</SelectItem>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              אין לקוחות שמתאימים לסינון הנוכחי.
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setQuery("")
                setStatusFilter(ALL)
                setTypeFilter(ALL)
              }}
            >
              נקה סינון
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-52">לקוח</TableHead>
                  <TableHead>סוג עוסק</TableHead>
                  <TableHead>תקופה</TableHead>
                  <TableHead className="text-start">סכום</TableHead>
                  <TableHead className="text-start">יתרה</TableHead>
                  <TableHead>תאריך יעד</TableHead>
                  <TableHead className="min-w-40">סטטוס גבייה</TableHead>
                  <TableHead>סטטוס תקופתי</TableHead>
                  <TableHead className="text-end">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(({ client, charge, balance, overdueDays }) => (
                  <TableRow
                    key={client.id}
                    className={overdueAccentClass(overdueDays)}
                  >
                    <TableCell>
                      <Link
                        href={`/clients/${client.id}`}
                        className="grid gap-0.5 hover:underline"
                      >
                        <span className="font-medium">
                          {client.businessName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {client.name} · {client.taxId}
                        </span>
                      </Link>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {client.businessType}
                    </TableCell>

                    <TableCell>{formatPeriod(charge.period)}</TableCell>

                    <TableCell className="font-mono tabular-nums">
                      {formatCurrency(charge.amount)}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "font-mono font-medium tabular-nums",
                        balance > 0 &&
                          overdueDays > 0 &&
                          "text-[var(--chart-4)]"
                      )}
                    >
                      {formatCurrency(balance)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="grid gap-0.5">
                        <span className="tabular-nums">
                          {formatDate(charge.dueDate)}
                        </span>
                        {overdueDays > 0 ? (
                          <span className="text-xs text-[var(--chart-4)]">
                            באיחור {overdueDays} ימים
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={charge.status}
                        onValueChange={(value) => {
                          const status = value as PaymentStatus
                          dispatch({
                            type: "SET_PAYMENT_STATUS",
                            chargeId: charge.id,
                            status,
                          })
                          toast.success(
                            `${client.businessName} — הסטטוס עודכן ל״${status}״`
                          )
                        }}
                      >
                        <SelectTrigger
                          size="sm"
                          className={cn(
                            "w-full justify-between border-0 font-medium",
                            PAYMENT_STATUS_CLASSES[charge.status]
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={PERIOD_STATUS_CLASSES[client.periodStatus]}
                      >
                        {client.periodStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => onReminder(client, charge)}
                      >
                        <MessageCircle />
                        צור תזכורת
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

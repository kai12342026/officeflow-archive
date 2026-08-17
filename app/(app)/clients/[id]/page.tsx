"use client"

import * as React from "react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { ChevronRight, Mail, MessageCircle, Phone } from "lucide-react"
import { toast } from "sonner"

import { AppHeader } from "@/components/app/app-header"
import { ReminderDialog } from "@/components/app/reminder-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PAYMENT_STATUS_CLASSES,
  balanceOf,
  formatCurrency,
  formatDate,
  formatPeriodLong,
} from "@/lib/demo/format"
import { focusCharge, useDemo } from "@/lib/demo/store"
import {
  PERIOD_STATUSES,
  type PeriodStatus,
  type ReminderKind,
} from "@/lib/demo/types"

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const { clients, dispatch } = useDemo()
  const client = clients.find((c) => c.id === params.id)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogKind, setDialogKind] =
    React.useState<ReminderKind>("תזכורת תשלום")

  if (!client) {
    notFound()
  }

  const charge = focusCharge(client)
  const openBalance = client.charges.reduce(
    (sum, item) => sum + balanceOf(item),
    0
  )

  function openReminder(kind: ReminderKind) {
    setDialogKind(kind)
    setDialogOpen(true)
  }

  return (
    <>
      <AppHeader title={client.businessName} subtitle={client.name} />

      <div className="grid gap-5 p-4 sm:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ms-2 w-fit"
          nativeButton={false}
          render={<Link href="/clients" />}
        >
          <ChevronRight />
          חזרה לרשימת הלקוחות
        </Button>

        <Card>
          <CardContent className="grid gap-5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {client.businessName}
                  </h2>
                  <Badge variant="outline">{client.businessType}</Badge>
                  <Badge variant="outline">דיווח {client.reportingCycle}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    <span dir="ltr" className="tabular-nums">
                      {client.phone}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    <span dir="ltr">{client.email}</span>
                  </span>
                  <span>מספר עוסק {client.taxId}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="grid gap-0.5 text-end">
                  <span className="text-xs text-muted-foreground">
                    יתרה פתוחה
                  </span>
                  <span className="font-mono text-xl font-bold tabular-nums">
                    {formatCurrency(openBalance)}
                  </span>
                </div>
                <Button onClick={() => openReminder("תזכורת תשלום")}>
                  <MessageCircle />
                  צור תזכורת
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <Label htmlFor="period-status" className="text-xs">
                סטטוס טיפול תקופתי
              </Label>
              <Select
                value={client.periodStatus}
                onValueChange={(value) => {
                  dispatch({
                    type: "SET_PERIOD_STATUS",
                    clientId: client.id,
                    status: value as PeriodStatus,
                  })
                  toast.success(`הסטטוס עודכן ל״${value}״`)
                }}
              >
                <SelectTrigger id="period-status" className="min-w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">פרטי התיק</TabsTrigger>
            <TabsTrigger value="payments">היסטוריית תשלומים</TabsTrigger>
            <TabsTrigger value="docs">
              חומרים חסרים
              {client.missingDocs.length > 0 ? (
                <Badge variant="destructive" className="ms-1.5">
                  {client.missingDocs.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardContent className="grid gap-6 p-5">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="איש קשר" value={client.name} />
                  <Field label="מספר עוסק" value={client.taxId} mono />
                  <Field label="סוג עוסק" value={client.businessType} />
                  <Field label="מחזור דיווח" value={client.reportingCycle} />
                  <Field
                    label="ריטיינר חודשי"
                    value={formatCurrency(client.monthlyFee)}
                    mono
                  />
                  <Field
                    label="לקוח מאז"
                    value={formatDate(client.joinedAt)}
                    mono
                  />
                </dl>

                {client.notes ? (
                  <div className="grid gap-1 rounded-lg bg-muted/60 p-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      הערות
                    </span>
                    <p className="text-sm">{client.notes}</p>
                  </div>
                ) : null}

                <div className="grid gap-3 border-t pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      שדות מותאמים אישית
                    </span>
                    <Button variant="ghost" size="sm" disabled>
                      + הוסף שדה
                    </Button>
                  </div>
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {client.customFields.map((field) => (
                      <Field
                        key={field.label}
                        label={field.label}
                        value={field.value}
                      />
                    ))}
                  </dl>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>תקופה</TableHead>
                        <TableHead>חשבונית</TableHead>
                        <TableHead className="text-start">סכום</TableHead>
                        <TableHead className="text-start">שולם</TableHead>
                        <TableHead className="text-start">יתרה</TableHead>
                        <TableHead>תאריך יעד</TableHead>
                        <TableHead>סטטוס</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...client.charges]
                        .sort((a, b) => b.period.localeCompare(a.period))
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatPeriodLong(item.period)}
                            </TableCell>
                            <TableCell
                              className="font-mono text-xs text-muted-foreground"
                              dir="ltr"
                            >
                              {item.invoiceNumber}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatCurrency(item.paidAmount)}
                            </TableCell>
                            <TableCell className="font-mono font-medium tabular-nums">
                              {formatCurrency(balanceOf(item))}
                            </TableCell>
                            <TableCell className="whitespace-nowrap tabular-nums">
                              {formatDate(item.dueDate)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={PAYMENT_STATUS_CLASSES[item.status]}
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs">
            <Card>
              <CardContent className="grid gap-4 p-5">
                {client.missingDocs.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    כל החומרים לתקופה הנוכחית התקבלו.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      סמן מסמך שהתקבל כדי להוריד אותו מהרשימה. כשהרשימה מתרוקנת
                      התיק עובר אוטומטית לסטטוס ״בטיפול״.
                    </p>
                    <ul className="grid gap-2">
                      {client.missingDocs.map((doc) => (
                        <li
                          key={doc}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <Checkbox
                            id={doc}
                            onCheckedChange={() => {
                              dispatch({
                                type: "RECEIVE_DOC",
                                clientId: client.id,
                                doc,
                              })
                              toast.success(`״${doc}״ סומן כהתקבל`)
                            }}
                          />
                          <Label htmlFor={doc} className="flex-1 font-normal">
                            {doc}
                          </Label>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      className="w-fit"
                      onClick={() => openReminder("בקשת חומרים חסרים")}
                    >
                      <MessageCircle />
                      בקש חומרים מהלקוח
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Remount per request kind so the draft resets between the two buttons. */}
      <ReminderDialog
        key={`${client.id}:${dialogKind}`}
        client={client}
        charge={charge}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialKind={dialogKind}
      />
    </>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-sm tabular-nums" : "text-sm"}>
        {value}
      </dd>
    </div>
  )
}

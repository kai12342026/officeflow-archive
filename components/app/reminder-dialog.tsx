"use client"

import * as React from "react"
import { Check, Copy, MessageCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import {
  daysOverdue,
  formatCurrency,
  formatPeriodLong,
} from "@/lib/demo/format"
import {
  templateReminder,
  type ReminderInput,
} from "@/lib/demo/reminder-template"
import {
  REMINDER_KINDS,
  type Charge,
  type Client,
  type ReminderKind,
} from "@/lib/demo/types"

const AI_TIMEOUT_MS = 6000

function buildInput(
  client: Client | null,
  charge: Charge | null,
  kind: ReminderKind
): ReminderInput | null {
  if (!client || !charge) return null
  return {
    clientName: client.name,
    businessName: client.businessName,
    amount: Math.max(0, charge.amount - charge.paidAmount),
    dueDate: charge.dueDate,
    period: charge.period,
    daysOverdue: daysOverdue(charge.dueDate),
    invoiceNumber: charge.invoiceNumber,
    missingDocs: client.missingDocs,
    kind,
  }
}

export function ReminderDialog({
  client,
  charge,
  open,
  onOpenChange,
  initialKind,
}: {
  client: Client | null
  charge: Charge | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialKind?: ReminderKind
}) {
  const [kind, setKind] = React.useState<ReminderKind>(
    initialKind ?? "תזכורת תשלום"
  )
  const [message, setMessage] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [source, setSource] = React.useState<"ai" | "template" | null>(null)
  const [copied, setCopied] = React.useState(false)

  // The store hands back a fresh `client` object on every edit. Reading the
  // latest values through a ref keeps `generate` stable, so opening the dialog
  // fetches exactly once instead of re-fetching over the user's manual edits.
  const latest = React.useRef({ client, charge, kind })
  React.useEffect(() => {
    latest.current = { client, charge, kind }
  })

  const generate = React.useCallback(async (nextKind: ReminderKind) => {
    const { client, charge } = latest.current
    const input = buildInput(client, charge, nextKind)
    if (!input) return

    setPending(true)
    setCopied(false)
    setSource(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

    try {
      const response = await fetch("/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(String(response.status))
      const data = (await response.json()) as {
        message: string
        source: "ai" | "template"
      }
      setMessage(data.message)
      setSource(data.source)
    } catch {
      // Timeout or network failure — show the deterministic version instead
      // of an error. The demo must never dead-end on a live API.
      setMessage(templateReminder(input))
      setSource("template")
    } finally {
      clearTimeout(timeout)
      setPending(false)
    }
  }, [])

  // The parent remounts this component per target (see the `key` it passes), so
  // `kind` is already correct on mount and only the fetch has to be kicked off.
  React.useEffect(() => {
    if (!open) return
    void generate(latest.current.kind)
  }, [open, generate])

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      toast.success("ההודעה הועתקה — אפשר להדביק בוואטסאפ")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("ההעתקה נכשלה. אפשר לסמן ולהעתיק ידנית.")
    }
  }

  function openWhatsApp() {
    if (!client) return
    const phone = `972${client.phone.replace(/\D/g, "").replace(/^0/, "")}`
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const balance = charge ? Math.max(0, charge.amount - charge.paidAmount) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            הודעה ללקוח
          </DialogTitle>
          <DialogDescription>
            {client && charge ? (
              <>
                {client.businessName} · {formatPeriodLong(charge.period)} ·{" "}
                <span className="font-mono tabular-nums">
                  {formatCurrency(balance)}
                </span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reminder-kind">סוג הפנייה</Label>
            <Select
              value={kind}
              onValueChange={(value) => {
                const nextKind = value as ReminderKind
                setKind(nextKind)
                void generate(nextKind)
              }}
            >
              <SelectTrigger id="reminder-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_KINDS.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    disabled={
                      option === "בקשת חומרים חסרים" &&
                      (client?.missingDocs.length ?? 0) === 0
                    }
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-message">נוסח ההודעה</Label>
              {pending ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Spinner className="size-3" />
                  מנסח…
                </span>
              ) : source === "ai" ? (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Sparkles className="size-2.5" />
                  נוסח ב-AI
                </Badge>
              ) : source === "template" ? (
                <Badge variant="outline" className="text-[10px]">
                  נוסח מתבנית
                </Badge>
              ) : null}
            </div>
            <Textarea
              id="reminder-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="resize-none leading-relaxed"
              placeholder="ההודעה תיווצר כאן…"
            />
            <p className="text-xs text-muted-foreground">
              אפשר לערוך את הטקסט לפני השליחה.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => void generate(kind)}
          >
            נסח מחדש
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyMessage}
              disabled={pending || !message}
            >
              {copied ? <Check /> : <Copy />}
              העתק
            </Button>
            <Button onClick={openWhatsApp} disabled={pending || !message}>
              <MessageCircle />
              פתח בוואטסאפ
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import * as React from "react"

import { DEMO_CLIENTS } from "./data"
import { balanceOf, daysOverdue } from "./format"
import type { Charge, Client, PaymentStatus, PeriodStatus } from "./types"

const STORAGE_KEY = "officeflow.demo.v1"

type Action =
  | { type: "HYDRATE"; clients: Client[] }
  | { type: "SET_PAYMENT_STATUS"; chargeId: string; status: PaymentStatus }
  | { type: "MARK_PAID"; chargeId: string }
  | { type: "SET_PERIOD_STATUS"; clientId: string; status: PeriodStatus }
  | { type: "RECEIVE_DOC"; clientId: string; doc: string }
  | { type: "RESET" }

function reducer(state: Client[], action: Action): Client[] {
  switch (action.type) {
    case "HYDRATE":
      return action.clients

    case "SET_PAYMENT_STATUS":
      return mapCharge(state, action.chargeId, (charge) => ({
        ...charge,
        status: action.status,
        // Marking a charge paid has to settle the balance too, otherwise the
        // KPIs and the row disagree with the badge the user just set.
        paidAmount:
          action.status === "שולם" ? charge.amount : charge.paidAmount,
      }))

    case "MARK_PAID":
      return mapCharge(state, action.chargeId, (charge) => ({
        ...charge,
        status: "שולם",
        paidAmount: charge.amount,
      }))

    case "SET_PERIOD_STATUS":
      return state.map((client) =>
        client.id === action.clientId
          ? { ...client, periodStatus: action.status }
          : client
      )

    case "RECEIVE_DOC":
      return state.map((client) => {
        if (client.id !== action.clientId) return client
        const missingDocs = client.missingDocs.filter((d) => d !== action.doc)
        return {
          ...client,
          missingDocs,
          // Once nothing is missing the file moves on by itself.
          periodStatus:
            missingDocs.length === 0 && client.periodStatus === "ממתין לחומרים"
              ? "בטיפול"
              : client.periodStatus,
        }
      })

    case "RESET":
      return DEMO_CLIENTS
  }
}

function mapCharge(
  state: Client[],
  chargeId: string,
  fn: (charge: Charge) => Charge
): Client[] {
  return state.map((client) => {
    if (!client.charges.some((c) => c.id === chargeId)) return client
    return {
      ...client,
      charges: client.charges.map((c) => (c.id === chargeId ? fn(c) : c)),
    }
  })
}

const DemoContext = React.createContext<{
  clients: Client[]
  dispatch: React.Dispatch<Action>
} | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [clients, dispatch] = React.useReducer(reducer, DEMO_CLIENTS)

  // Read persisted state only after mount — reading localStorage during render
  // would desync the server-rendered HTML.
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        dispatch({ type: "HYDRATE", clients: JSON.parse(stored) as Client[] })
      }
    } catch {
      // Corrupted or unavailable storage just falls back to the seed data.
    }
  }, [])

  // Skip the mount pass so the seed data never overwrites a stored session
  // before the effect above has had a chance to read it.
  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
    } catch {
      // Private-mode quota errors must not break the demo.
    }
  }, [clients])

  const value = React.useMemo(() => ({ clients, dispatch }), [clients])

  return <DemoContext value={value}>{children}</DemoContext>
}

export function useDemo() {
  const context = React.useContext(DemoContext)
  if (!context) {
    throw new Error("useDemo must be used inside <DemoProvider>")
  }
  return context
}

/* -------------------------------------------------------------------------- */
/* Selectors                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The one charge worth chasing for a client: the oldest still-open one, or the
 * most recent charge when everything is settled.
 */
export function focusCharge(client: Client): Charge {
  const open = client.charges
    .filter((c) => balanceOf(c) > 0)
    .sort((a, b) => a.period.localeCompare(b.period))
  return open[0] ?? client.charges[client.charges.length - 1]
}

export interface DashboardRow {
  client: Client
  charge: Charge
  balance: number
  overdueDays: number
}

export function buildRows(clients: Client[]): DashboardRow[] {
  return clients
    .map((client) => {
      const charge = focusCharge(client)
      return {
        client,
        charge,
        balance: balanceOf(charge),
        overdueDays: balanceOf(charge) > 0 ? daysOverdue(charge.dueDate) : 0,
      }
    })
    .sort((a, b) => b.overdueDays - a.overdueDays)
}

export interface Kpis {
  openTotal: number
  overdueTotal: number
  collectedThisMonth: number
  overdueClients: number
  awaitingDocs: number
}

export function computeKpis(clients: Client[]): Kpis {
  let openTotal = 0
  let overdueTotal = 0
  let collectedThisMonth = 0
  let overdueClients = 0
  let awaitingDocs = 0

  for (const client of clients) {
    let clientIsOverdue = false

    for (const charge of client.charges) {
      const balance = balanceOf(charge)
      openTotal += balance

      if (balance > 0 && daysOverdue(charge.dueDate) > 0) {
        overdueTotal += balance
        clientIsOverdue = true
      }

      // "Collected this month" = payments landed against the newest period.
      if (charge.period === "2026-08" || charge.period === "2026-07") {
        collectedThisMonth += charge.paidAmount
      }
    }

    if (clientIsOverdue) overdueClients += 1
    if (client.missingDocs.length > 0) awaitingDocs += 1
  }

  return {
    openTotal,
    overdueTotal,
    collectedThisMonth,
    overdueClients,
    awaitingDocs,
  }
}

/** Billed vs. collected per period, oldest first — for the bar chart. */
export function buildTrend(clients: Client[], periods: string[]) {
  return periods.map((period) => {
    let billed = 0
    let collected = 0
    for (const client of clients) {
      for (const charge of client.charges) {
        if (charge.period !== period) continue
        billed += charge.amount
        collected += charge.paidAmount
      }
    }
    return { period, billed, collected }
  })
}

/** Open balance grouped by payment status — for the donut. */
export function buildStatusBreakdown(clients: Client[]) {
  const totals = new Map<PaymentStatus, number>()
  for (const client of clients) {
    for (const charge of client.charges) {
      const balance = balanceOf(charge)
      if (balance <= 0) continue
      totals.set(charge.status, (totals.get(charge.status) ?? 0) + balance)
    }
  }
  return [...totals.entries()].map(([status, value]) => ({ status, value }))
}

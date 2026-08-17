"use client"

import * as React from "react"

import { AppHeader } from "@/components/app/app-header"
import {
  CollectionsTrendChart,
  StatusBreakdownChart,
} from "@/components/app/collections-charts"
import { CollectionsTable } from "@/components/app/collections-table"
import { KpiCards } from "@/components/app/kpi-cards"
import { ReminderDialog } from "@/components/app/reminder-dialog"
import { computeKpis, useDemo } from "@/lib/demo/store"
import type { Charge, Client } from "@/lib/demo/types"

export default function DashboardPage() {
  const { clients } = useDemo()
  const kpis = React.useMemo(() => computeKpis(clients), [clients])

  const [target, setTarget] = React.useState<{
    client: Client
    charge: Charge
  } | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Keep the dialog's client in sync after a status change re-creates the row.
  const liveClient = target
    ? (clients.find((c) => c.id === target.client.id) ?? target.client)
    : null

  return (
    <>
      <AppHeader
        title="דשבורד גבייה"
        subtitle="אוגוסט 2026 · תמונת מצב של כל התיקים"
      />

      <div className="grid gap-5 p-4 sm:p-6">
        <KpiCards kpis={kpis} />

        <div className="grid gap-5 xl:grid-cols-3">
          <CollectionsTrendChart clients={clients} />
          <StatusBreakdownChart clients={clients} />
        </div>

        <CollectionsTable
          onReminder={(client, charge) => {
            setTarget({ client, charge })
            setDialogOpen(true)
          }}
        />
      </div>

      {/* Remount per target so the dialog starts from a clean draft each time. */}
      <ReminderDialog
        key={target ? `${target.client.id}:${target.charge.id}` : "none"}
        client={liveClient}
        charge={target?.charge ?? null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

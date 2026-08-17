"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CHART_PERIODS } from "@/lib/demo/data"
import {
  PAYMENT_STATUS_CHART_VAR,
  formatCompactCurrency,
  formatCurrency,
  formatPeriod,
} from "@/lib/demo/format"
import { buildStatusBreakdown, buildTrend } from "@/lib/demo/store"
import type { Client } from "@/lib/demo/types"

const trendConfig = {
  billed: { label: "חויב", color: "var(--chart-5)" },
  collected: { label: "נגבה", color: "var(--chart-1)" },
} satisfies ChartConfig

export function CollectionsTrendChart({ clients }: { clients: Client[] }) {
  const data = React.useMemo(
    () =>
      buildTrend(clients, CHART_PERIODS).map((row) => ({
        ...row,
        month: formatPeriod(row.period),
      })),
    [clients]
  )

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">חיוב מול גבייה</CardTitle>
        <CardDescription>ששת החודשים האחרונים</CardDescription>
      </CardHeader>
      <CardContent>
        {/*
          Recharts computes all geometry in LTR pixel space and emits SVG
          text-anchor="start|end", which inverts under dir="rtl" and tears the
          Y-axis labels off the axis. Pin the chart to LTR and mirror it
          declaratively instead: reversed X, Y on the right.
        */}
        <ChartContainer
          dir="ltr"
          config={trendConfig}
          className="h-[240px] w-full"
        >
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              reversed
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value: number) => formatCompactCurrency(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="text-start [direction:rtl]"
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent className="[direction:rtl]" />}
            />
            <Bar dataKey="billed" fill="var(--color-billed)" radius={4} />
            <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function StatusBreakdownChart({ clients }: { clients: Client[] }) {
  const data = React.useMemo(() => buildStatusBreakdown(clients), [clients])

  const config = React.useMemo<ChartConfig>(() => {
    const entries = data.map((row) => [
      row.status,
      { label: row.status, color: PAYMENT_STATUS_CHART_VAR[row.status] },
    ])
    return Object.fromEntries(entries) as ChartConfig
  }, [data])

  const total = data.reduce((sum, row) => sum + row.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">התפלגות החוב הפתוח</CardTitle>
        <CardDescription>לפי סטטוס גבייה</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            אין חוב פתוח — הכול נגבה.
          </p>
        ) : (
          <ChartContainer
            dir="ltr"
            config={config}
            className="mx-auto h-[240px] w-full"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="text-start [direction:rtl]"
                    nameKey="status"
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((row) => (
                  <Cell
                    key={row.status}
                    fill={PAYMENT_STATUS_CHART_VAR[row.status]}
                  />
                ))}
              </Pie>
              <ChartLegend
                content={
                  <ChartLegendContent
                    nameKey="status"
                    className="flex-wrap [direction:rtl]"
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

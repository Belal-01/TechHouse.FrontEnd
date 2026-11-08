"use client"

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toUserMessage } from "@/lib/api/errors"
import { useDashboard } from "../api/dashboard"
import { periodRange, PERIODS } from "../lib/periods"
import { AlertsCard } from "./alerts-card"
import { KpiTiles } from "./kpi-tiles"
import { PeriodPicker } from "./period-picker"
import { PnlCard } from "./pnl-card"
import { TopProductsCard } from "./top-products-card"
import { TrendCard } from "./trend-card"

// The period lives in the URL, so reload and shared links keep it. Custom dates only matter for "custom".
const parsers = {
  period: parseAsStringLiteral(PERIODS).withDefault("month"),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
}

export function DashboardView() {
  const [state, setState] = useQueryStates(parsers)
  const preset = state.period === "custom" ? null : periodRange(state.period)
  const custom = periodRange("month")
  const from = preset?.from ?? (state.from || custom.from)
  const to = preset?.to ?? (state.to || custom.to)
  const dashboard = useDashboard(from, to)
  const data = dashboard.data

  return (
    <div className="flex flex-col gap-6">
      <PeriodPicker
        period={state.period}
        from={from}
        to={to}
        onChange={(next) =>
          setState(next.period === "custom" ? { period: "custom", from: next.from ?? from, to: next.to ?? to } : { period: next.period, from: null, to: null })
        }
      />

      {dashboard.isPending ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      ) : dashboard.isError ? (
        <div className="flex flex-col items-start gap-3">
          <Alert>{toUserMessage(dashboard.error)}</Alert>
          <Button variant="outline" onClick={() => dashboard.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : data ? (
        <div className={dashboard.isPlaceholderData ? "flex flex-col gap-6 opacity-60 transition-opacity" : "flex flex-col gap-6"}>
          <KpiTiles data={data} />
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <div className="min-w-0 lg:col-span-2">
              <TrendCard series={data.series} unit={data.seriesUnit} />
            </div>
            <PnlCard pnl={data.pnl} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <TopProductsCard products={data.topProducts} />
            <AlertsCard alerts={data.alerts} rate={data.rate} returns={data.returns} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

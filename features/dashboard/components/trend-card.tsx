"use client"

import { BarLineChart } from "@/components/common/bar-line-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDayMonth, formatMoney, formatMoneyCompact, formatMonthYear } from "@/lib/format"
import type { Dashboard } from "../types"

export function TrendCard({ series, unit }: { series: Dashboard["series"]; unit: Dashboard["seriesUnit"] }) {
  const points = series.map((p) => ({
    key: p.date,
    label: unit === "MONTH" ? formatMonthYear(p.date).split(" ")[0] : formatDayMonth(p.date),
    title: unit === "MONTH" ? formatMonthYear(p.date) : formatDate(`${p.date}T00:00:00`),
    bar: p.revenueUsd,
    line: p.netProfitUsd,
  }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>الإيراد وصافي الربح {unit === "MONTH" ? "حسب الشهر" : "حسب اليوم"}</CardTitle>
      </CardHeader>
      <CardContent>
        <BarLineChart
          points={points}
          barLabel="الإيراد"
          lineLabel="صافي الربح"
          formatValue={formatMoney}
          formatAxis={formatMoneyCompact}
          caption="الإيراد وصافي الربح خلال الفترة"
        />
      </CardContent>
    </Card>
  )
}

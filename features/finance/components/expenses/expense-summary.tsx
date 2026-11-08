"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney, formatQuantity } from "@/lib/format"
import type { ExpenseSummary as Summary } from "../../types"

/** Month total and each category's share, in USD. */
export function ExpenseSummary({ summary, isLoading }: { summary: Summary | undefined; isLoading: boolean }) {
  if (isLoading || !summary) return <Skeleton className="h-32 w-full" />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-baseline justify-between gap-2">
          <span>مصاريف الفترة</span>
          <span dir="ltr" className="h2">
            {formatMoney(summary.totalUsd)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary.categories.length === 0 ? (
          <p className="small text-muted-foreground">لا توجد مصاريف في هذه الفترة.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.categories.map((row) => {
              const share = summary.totalUsd > 0 ? (row.amountUsd / summary.totalUsd) * 100 : 0
              return (
                <li key={row.category.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 small">
                    <span className="font-semibold text-foreground">{row.category.name}</span>
                    <span dir="ltr">{formatMoney(row.amountUsd)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-sm bg-muted" aria-hidden>
                    <div className="h-full bg-blue" style={{ width: `${share}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatQuantity(row.count)} مصروف</span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

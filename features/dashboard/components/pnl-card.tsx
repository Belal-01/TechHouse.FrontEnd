import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Dashboard } from "../types"

function Row({ label, value, strong, sign }: { label: ReactNode; value: number; strong?: boolean; sign?: "−" }) {
  return (
    <div className={cn("flex justify-between gap-4", strong && "border-t pt-2 font-semibold text-foreground")}>
      <dt className={strong ? undefined : "text-muted-foreground"}>
        {sign ? `${sign} ` : null}
        {label}
      </dt>
      <dd dir="ltr" className={value < 0 ? "text-red" : undefined}>
        {formatMoney(value)}
      </dd>
    </div>
  )
}

/** How the period's net profit is made: revenue − cost of goods − expenses. */
export function PnlCard({ pnl }: { pnl: Dashboard["pnl"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الربح في الفترة</CardTitle>
        <CardDescription>الإيراد عند التسليم، والتكلفة الواصلة لما بيع.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2 small">
          <Row label="الإيراد" value={pnl.revenueUsd} />
          <Row label="تكلفة البضاعة" value={pnl.cogsUsd} sign="−" />
          <Row label="الربح الإجمالي" value={pnl.grossProfitUsd} strong />
          <Row label="المصاريف" value={pnl.expensesUsd} sign="−" />
          <Row label="صافي الربح" value={pnl.netProfitUsd} strong />
        </dl>
      </CardContent>
    </Card>
  )
}

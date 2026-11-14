import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"

type SummaryCardProps = { goodsTotal: number; costsTotal: number; hasSyp: boolean }

export function SummaryCard({ goodsTotal, costsTotal, hasSyp }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الإجمالي</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2 small" aria-live="polite">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">قيمة البضاعة</dt>
            <dd dir="ltr">{formatMoney(goodsTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">التكاليف</dt>
            <dd dir="ltr">{formatMoney(costsTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-2 font-semibold text-foreground">
            <dt>الإجمالي حتى الآن</dt>
            <dd dir="ltr">{formatMoney(goodsTotal + costsTotal)}</dd>
          </div>
        </dl>
        {hasSyp ? <p className="mt-3 text-xs text-muted-foreground">التكاليف بالليرة محسوبة بسعر المبيع الحالي.</p> : null}
      </CardContent>
    </Card>
  )
}

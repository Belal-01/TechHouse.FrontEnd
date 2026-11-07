import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDateTime } from "@/lib/format"
import type { ExchangeRate } from "../types"
import { RateSourceBadge } from "./rate-badges"
import { SypAmount } from "./syp-amount"

export function CurrentRateCard({ rate }: { rate: ExchangeRate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>السعر المستخدم</CardTitle>
        <CardDescription>
          سعر {formatDate(rate.rateDate)}. الطلبات والمصاريف تحفظ السعر لحظة إدخالها.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="flex flex-wrap items-baseline gap-2">
          <span className="small text-muted-foreground">1 دولار =</span>
          <SypAmount value={rate.midRate} className="h1 text-foreground" />
        </p>
        <dl className="grid grid-cols-2 gap-3 small sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">شراء</dt>
            <dd>
              <SypAmount value={rate.buyRate} hideUnit />
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">مبيع</dt>
            <dd>
              <SypAmount value={rate.sellRate} hideUnit />
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">المصدر</dt>
            <dd>
              <RateSourceBadge source={rate.source} />
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">آخر تحديث</dt>
            <dd>{formatDateTime(rate.sourceUpdatedAt ?? rate.updatedAt)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

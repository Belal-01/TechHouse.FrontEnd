import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDateTime } from "@/lib/format"
import type { ExchangeRate } from "../types"
import { RateSourceBadge } from "./rate-badges"
import { SypAmount } from "@/components/common/syp-amount"

export function CurrentRateCard({ rate }: { rate: ExchangeRate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>السعر المستخدم</CardTitle>
        <CardDescription>
          سعر دولار واحد بالليرة السورية، {formatDate(rate.rateDate)}. الطلبات تحفظ سعر المبيع لحظة إدخالها.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="small text-muted-foreground">شراء</dt>
            <dd>
              <SypAmount value={rate.buyRate} className="h2 text-foreground" />
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="small text-muted-foreground">مبيع (يُستخدم في البيع)</dt>
            <dd>
              <SypAmount value={rate.sellRate} className="h2 text-foreground" />
            </dd>
          </div>
        </dl>
        <dl className="grid grid-cols-2 gap-3 small">
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

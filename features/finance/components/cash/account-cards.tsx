"use client"

import { MoneyAmount } from "@/components/common/money-amount"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toUserMessage } from "@/lib/api/errors"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CashAccount } from "../../types"

type AccountCardsProps = {
  accounts: CashAccount[] | undefined
  isLoading: boolean
  error: unknown
  /** Sell rate, to show the total in dollars; null hides that line. */
  sellRate: number | null
}

function Balance({ label, value, currency }: { label: string; value: number; currency: "USD" | "SYP" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="small text-muted-foreground">{label}</dt>
      <dd>
        <MoneyAmount value={value} currency={currency} className={cn("h3", value < 0 ? "text-red" : "text-foreground")} />
      </dd>
    </div>
  )
}

/** One card per box, then the totals. Negative balances show in red. */
export function AccountCards({ accounts, isLoading, error, sellRate }: AccountCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    )
  }
  if (error || !accounts) return <Alert>{toUserMessage(error)}</Alert>

  const usd = accounts.reduce((sum, a) => sum + a.usd, 0)
  const syp = accounts.reduce((sum, a) => sum + a.syp, 0)
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id} className={account.active ? undefined : "opacity-60"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {account.name}
              {account.isDefault ? <Badge variant="info">الافتراضي</Badge> : null}
              {account.active ? null : <Badge variant="outline">غير فعّال</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2">
              <Balance label="دولار" value={account.usd} currency="USD" />
              <Balance label="ليرة" value={account.syp} currency="SYP" />
            </dl>
          </CardContent>
        </Card>
      ))}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>المجموع</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-2">
            <Balance label="دولار" value={usd} currency="USD" />
            <Balance label="ليرة" value={syp} currency="SYP" />
            {sellRate ? (
              <div className="flex items-baseline justify-between gap-3 border-t pt-2 small">
                <dt className="text-muted-foreground">الكل بالدولار (سعر المبيع)</dt>
                <dd dir="ltr" className="font-semibold text-foreground">
                  {formatMoney(usd + syp / sellRate)}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

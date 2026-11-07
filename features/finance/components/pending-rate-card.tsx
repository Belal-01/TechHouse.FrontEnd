"use client"

import { useState } from "react"
import { CircleAlert, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toUserMessage } from "@/lib/api/errors"
import { useApproveRate } from "../api/exchange-rates"
import type { ExchangeRate } from "../types"
import { SypAmount } from "./syp-amount"

type PendingRateCardProps = {
  pending: ExchangeRate
  current?: ExchangeRate | null
  onEnterManually: () => void
}

/** A fetched rate that moved more than 20%: show the jump and let the owner approve it or enter a rate instead. */
export function PendingRateCard({ pending, current, onEnterManually }: PendingRateCardProps) {
  const approve = useApproveRate()
  const [error, setError] = useState<string | null>(null)
  // Sales use the sell rate, so that is the change that matters.
  const change = current ? ((pending.sellRate - current.sellRate) / current.sellRate) * 100 : null

  const onApprove = async () => {
    setError(null)
    try {
      await approve.mutateAsync(pending.id)
      toast.success("اعتُمد السعر الجديد")
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red">
          <CircleAlert className="size-5" aria-hidden />
          سعر جديد بانتظار المراجعة
        </CardTitle>
        <CardDescription>
          جُلب سعر يختلف كثيراً عن السعر المستخدم، فلم يُعتمد تلقائياً. تأكّد منه قبل اعتماده.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-2">
            <dt className="small text-muted-foreground">شراء</dt>
            <dd>
              <SypAmount value={pending.buyRate} className="h3 text-foreground" />
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="small text-muted-foreground">مبيع</dt>
            <dd>
              <SypAmount value={pending.sellRate} className="h3 text-foreground" />
            </dd>
          </div>
          {change !== null ? (
            <p className="small text-muted-foreground">
              تغيّر سعر المبيع <span dir="ltr">{`${change > 0 ? "+" : ""}${change.toFixed(1)}%`}</span>
            </p>
          ) : null}
        </dl>
        {error ? <Alert>{error}</Alert> : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onApprove} disabled={approve.isPending}>
            {approve.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            اعتماد السعر الجديد
          </Button>
          <Button variant="outline" onClick={onEnterManually}>
            إدخال سعر يدوياً
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

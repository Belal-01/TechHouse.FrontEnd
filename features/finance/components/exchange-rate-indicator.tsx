"use client"

import Link from "next/link"
import { CircleAlert, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSyp } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCurrentRate } from "../api/exchange-rates"
import { SypAmount } from "./syp-amount"

/**
 * Today's dollar rate, always visible in the header. Links to the exchange-rates page.
 * A warning mark appears when the rate is not from today or a new rate waits for review.
 */
export function ExchangeRateIndicator() {
  const rate = useCurrentRate()

  if (rate.isPending) return <Skeleton className="h-8 w-28" aria-label="جارٍ تحميل سعر الصرف" />

  const data = rate.data
  const current = data?.current
  const needsAttention = rate.isError || !current || data.stale || Boolean(data.pendingReview)

  const label = rate.isError
    ? "تعذّر تحميل سعر الصرف"
    : current
      ? `سعر الدولار بالليرة السورية: شراء ${formatSyp(current.buyRate)}، مبيع ${formatSyp(current.sellRate)}${data.stale ? "، ليس سعر اليوم" : ""}${data.pendingReview ? "، يوجد سعر جديد بانتظار المراجعة" : ""}`
      : "لا يوجد سعر صرف. أدخله الآن"

  return (
    <Link
      href="/finance/exchange-rates"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-sm font-semibold transition-colors hover:bg-muted",
        needsAttention ? "border-destructive text-red" : "border-border text-foreground",
      )}
    >
      {needsAttention ? <CircleAlert className="size-4 shrink-0" aria-hidden /> : <DollarSign className="size-4 shrink-0 text-blue" aria-hidden />}
      {current ? (
        // Phones: "14,450 / 14,525"; wider screens add the labels and the unit.
        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="hidden font-normal text-muted-foreground sm:inline">شراء</span>
          <SypAmount value={current.buyRate} hideUnit />
          <span className="text-muted-foreground sm:hidden" aria-hidden>
            /
          </span>
          <span className="hidden font-normal text-muted-foreground sm:inline">· مبيع</span>
          <SypAmount value={current.sellRate} hideUnit />
          <span className="hidden font-normal text-muted-foreground md:inline">ل.س</span>
        </span>
      ) : (
        <span>{rate.isError ? "سعر الصرف" : "لا يوجد سعر"}</span>
      )}
    </Link>
  )
}

"use client"

import { useState } from "react"
import { Coins, LoaderCircle, PencilLine, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useHydrated } from "@/hooks/use-hydrated"
import { toUserMessage } from "@/lib/api/errors"
import { formatDate, formatQuantity } from "@/lib/format"
import { useCurrentRate, useRateHistory, useRefreshRate } from "../api/exchange-rates"
import type { ExchangeRate } from "../types"
import { CurrentRateCard } from "./current-rate-card"
import { ManualRateDialog } from "./manual-rate-dialog"
import { PendingRateCard } from "./pending-rate-card"
import { RateSourceBadge, RateStatusBadge } from "./rate-badges"
import { SypAmount } from "@/components/common/syp-amount"

const HISTORY_DAYS = 30

const columns: DataTableColumn<ExchangeRate>[] = [
  { id: "date", header: "التاريخ", cell: (rate) => formatDate(rate.rateDate) },
  { id: "buy", header: "شراء", cell: (rate) => <SypAmount value={rate.buyRate} hideUnit /> },
  {
    id: "sell",
    header: "مبيع",
    cell: (rate) => <SypAmount value={rate.sellRate} hideUnit className="font-semibold text-foreground" />,
  },
  { id: "source", header: "المصدر", className: "hidden md:table-cell", cell: (rate) => <RateSourceBadge source={rate.source} /> },
  { id: "status", header: "الحالة", align: "end", cell: (rate) => <RateStatusBadge status={rate.status} /> },
]

export function ExchangeRatesView() {
  const current = useCurrentRate()
  // The header reads the same query; its data may arrive before this page hydrates.
  const hydrated = useHydrated()
  const history = useRateHistory(HISTORY_DAYS)
  const refresh = useRefreshRate()
  const [manual, setManual] = useState({ open: false, session: 0 })
  const openManual = () => setManual((s) => ({ open: true, session: s.session + 1 }))

  const data = hydrated ? current.data : undefined
  const configured = data?.apiUsage.configured ?? false

  const onRefresh = async () => {
    try {
      const result = await refresh.mutateAsync()
      if (result.pendingReview) toast.warning("جُلب سعر جديد يختلف كثيراً، وهو بانتظار مراجعتك.")
      else toast.success("تم تحديث سعر الصرف")
    } catch (error) {
      toast.error(toUserMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="أسعار الصرف"
        description="سعر الدولار بالليرة السورية في دمشق، ويُستخدم سعر المبيع في البيع. يُحدَّث تلقائياً مرتين يومياً: 10 صباحاً و4 عصراً."
        actions={
          <>
            <Button variant="outline" onClick={openManual}>
              <PencilLine aria-hidden />
              إدخال يدوي
            </Button>
            <Button onClick={onRefresh} disabled={!configured || refresh.isPending}>
              {refresh.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : <RefreshCw aria-hidden />}
              تحديث الآن
            </Button>
          </>
        }
      />

      {current.isPending || !hydrated ? (
        <Skeleton className="h-48 w-full" />
      ) : current.isError ? (
        <div className="flex flex-col items-start gap-3">
          <Alert>{toUserMessage(current.error)}</Alert>
          <Button variant="outline" onClick={() => current.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <>
          {data?.pendingReview ? (
            <PendingRateCard pending={data.pendingReview} current={data.current} onEnterManually={openManual} />
          ) : null}
          {data?.current && data.stale ? (
            <Alert>
              السعر المستخدم ليس سعر اليوم ({formatDate(data.current.rateDate)}). حدّثه الآن أو أدخل سعر اليوم يدوياً.
            </Alert>
          ) : null}
          {!configured ? (
            <Alert>جلب السعر تلقائياً غير مفعّل لأن مفتاح الـ API غير مضبوط على الخادم. أدخل السعر يدوياً.</Alert>
          ) : null}

          {data?.current ? (
            <CurrentRateCard rate={data.current} />
          ) : (
            <EmptyState
              icon={Coins}
              title="لا يوجد سعر صرف بعد"
              description="الطلبات بالليرة تحتاج سعر صرف. حدّثه من الإنترنت أو أدخله يدوياً."
              action={
                <Button variant="outline" onClick={openManual}>
                  <PencilLine aria-hidden />
                  إدخال يدوي
                </Button>
              }
            />
          )}

          {configured && data ? (
            <p className="small text-muted-foreground">
              طلبات جلب السعر هذا الشهر: <span dir="ltr">{formatQuantity(data.apiUsage.used)}</span> من{" "}
              <span dir="ltr">{formatQuantity(data.apiUsage.limit)}</span>
              {data.apiUsage.providerRemaining != null ? (
                <>
                  {" "}
                  (المتبقي عند المزوّد: <span dir="ltr">{formatQuantity(data.apiUsage.providerRemaining)}</span>)
                </>
              ) : null}
            </p>
          ) : null}
        </>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="rate-history-title">
        <h2 id="rate-history-title" className="h3">
          آخر {HISTORY_DAYS} يوماً
        </h2>
        <DataTable
          caption="سجل أسعار الصرف"
          columns={columns}
          rows={history.data}
          getRowId={(rate) => rate.id}
          isLoading={history.isPending}
          error={history.isError ? toUserMessage(history.error) : null}
          onRetry={() => history.refetch()}
          empty={<EmptyState icon={Coins} title="لا يوجد سجل بعد" />}
        />
      </section>

      <ManualRateDialog
        key={manual.session}
        open={manual.open}
        onOpenChange={(open) => setManual((s) => ({ ...s, open }))}
        initial={data?.current}
      />
    </div>
  )
}

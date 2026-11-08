import Link from "next/link"
import { CircleAlert, Clock, PackageX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney, formatQuantity } from "@/lib/format"
import type { Dashboard } from "../types"

type AlertsCardProps = Pick<Dashboard, "alerts" | "rate" | "returns">

/** Things that need a look: stock running out, late orders, the exchange rate, and what returns cost. */
export function AlertsCard({ alerts, rate, returns }: AlertsCardProps) {
  const rateProblem = !rate.sellRate ? "لا يوجد سعر صرف" : rate.pendingReview ? "سعر صرف جديد بانتظار المراجعة" : rate.stale ? "سعر الصرف ليس سعر اليوم" : null
  const total = returns.returned + returns.delivered
  const nothing = !rateProblem && alerts.lowStock.length === 0 && alerts.lateOrders.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>تنبيهات</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 small">
        {rateProblem ? (
          <Link href="/finance/exchange-rates" className="flex items-center gap-2 text-red hover:underline">
            <CircleAlert className="size-4 shrink-0" aria-hidden />
            {rateProblem}
          </Link>
        ) : null}

        {alerts.lowStock.length > 0 ? (
          <section className="flex flex-col gap-1.5">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <PackageX className="size-4 text-red" aria-hidden />
              قارب على النفاد (أقل من {formatQuantity(alerts.lowStockThreshold)})
            </h3>
            <ul className="flex flex-col gap-1">
              {alerts.lowStock.map((p) => (
                <li key={p.productId} className="flex justify-between gap-3">
                  <Link href={`/catalog/products/${p.productId}`} className="truncate hover:text-blue hover:underline">
                    {p.name}
                  </Link>
                  <span className={p.available === 0 ? "shrink-0 text-red" : "shrink-0 text-muted-foreground"}>
                    {p.available === 0 ? "نفد" : `${formatQuantity(p.available)} متبقٍ`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {alerts.lateOrders.length > 0 ? (
          <section className="flex flex-col gap-1.5">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <Clock className="size-4 text-red" aria-hidden />
              قيد التوصيل منذ أكثر من {formatQuantity(alerts.lateOrderDays)} أيام
            </h3>
            <ul className="flex flex-col gap-1">
              {alerts.lateOrders.map((o) => (
                <li key={o.orderId} className="flex justify-between gap-3">
                  <Link href={`/sales/orders/${o.orderId}`} className="truncate hover:text-blue hover:underline">
                    <span dir="ltr">{o.orderNumber}</span> · {o.customerName ?? "—"}
                  </Link>
                  <span className="shrink-0 text-muted-foreground">{formatQuantity(o.days)} يوم</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {nothing ? <p className="text-muted-foreground">لا شيء يحتاج انتباهك الآن.</p> : null}

        <p className="border-t pt-3 text-muted-foreground">
          المرتجعات في الفترة: {formatQuantity(returns.returned)}
          {total > 0 ? ` من ${formatQuantity(total)} (${Math.round((returns.returned / total) * 100)}%)` : ""}
          {returns.deliveryCostUsd > 0 ? (
            <>
              {" "}· كلّفت أجور توصيلها <span dir="ltr">{formatMoney(returns.deliveryCostUsd)}</span>
            </>
          ) : null}
        </p>
      </CardContent>
    </Card>
  )
}

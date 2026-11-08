"use client"

import type { ReactNode } from "react"
import { FileX } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { FormPageHeader } from "@/components/common/form-page-header"
import { MoneyAmount } from "@/components/common/money-amount"
import { SypAmount } from "@/components/common/syp-amount"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError, toUserMessage } from "@/lib/api/errors"
import { formatDateTime, formatMoney, formatQuantity } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useOrder } from "../api/orders"
import { ORDER_STATUS_LABELS } from "../lib/order-status"
import type { OrderDetail, OrderItem } from "../types"
import { OrderActions } from "./order-actions"
import { OrderDetailSkeleton } from "./order-detail-skeleton"
import { OrderStatusBadge } from "./order-status-badge"

const usd = (value: number, className?: string) => (
  <span dir="ltr" className={className}>
    {formatMoney(value)}
  </span>
)

function Row({ label, children, strong = false }: { label: ReactNode; children: ReactNode; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", strong && "border-t pt-2 font-semibold text-foreground")}>
      <dt className={strong ? undefined : "text-muted-foreground"}>{label}</dt>
      <dd className="text-end">{children}</dd>
    </div>
  )
}

function itemColumns(order: OrderDetail): DataTableColumn<OrderItem>[] {
  return [
    {
      id: "product",
      header: "المنتج",
      className: "whitespace-normal!",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{item.product.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatQuantity(item.quantity)} × <MoneyAmount value={item.unitPrice} currency={order.currency} />
          </span>
        </div>
      ),
    },
    { id: "cost", header: "التكلفة", className: "hidden sm:table-cell", cell: (item) => usd(item.costUsd) },
    {
      id: "total",
      header: "المجموع",
      align: "end",
      cell: (item) => <MoneyAmount value={item.lineTotal} currency={order.currency} className="font-semibold" />,
    },
  ]
}

const PROFIT_LABEL = { PENDING: "الربح المتوقع", DELIVERED: "الربح", RETURNED: "الخسارة (أجرة التوصيل)", VOIDED: "الربح" } as const

export function OrderDetailView({ orderId }: { orderId: string }) {
  const order = useOrder(orderId)

  if (order.isPending) return <OrderDetailSkeleton />
  if (order.isError) {
    if (order.error instanceof ApiError && order.error.status === 404) {
      return (
        <EmptyState
          icon={FileX}
          title="الطلب غير موجود"
          action={
            <ButtonLink variant="outline" href="/sales/orders">
              العودة إلى الطلبات
            </ButtonLink>
          }
        />
      )
    }
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert>{toUserMessage(order.error)}</Alert>
        <Button variant="outline" onClick={() => order.refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  const data = order.data
  const { money } = data
  return (
    <div className="flex flex-col gap-6">
      <FormPageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span dir="ltr">{data.orderNumber}</span>
            <OrderStatusBadge status={data.status} />
          </span>
        }
        backHref="/sales/orders"
        backLabel="الطلبات"
        actions={data.status === "PENDING" ? <OrderActions orderId={data.id} /> : null}
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <section className="flex flex-col gap-3" aria-labelledby="order-items-title">
            <h2 id="order-items-title" className="h3">
              المنتجات
            </h2>
            <DataTable caption="منتجات الطلب" columns={itemColumns(data)} rows={data.items} getRowId={(item) => item.id} />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>السجل</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-3">
                {data.history.map((event, index) => (
                  <li key={index} className="flex flex-col gap-0.5 border-s-2 ps-3">
                    <span className="small font-semibold text-foreground">{ORDER_STATUS_LABELS[event.toStatus]}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(event.at)}</span>
                    {event.note ? <span className="small whitespace-pre-line">{event.note}</span> : null}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>المبلغ والربح</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-2 small">
                <Row label="المنتجات">
                  <MoneyAmount value={data.itemsTotal} currency={data.currency} />
                </Row>
                {data.deliveryFeeCharged > 0 ? (
                  <Row label="رسوم توصيل على الزبون">
                    <MoneyAmount value={data.deliveryFeeCharged} currency={data.currency} />
                  </Row>
                ) : null}
                <Row label="يدفع الزبون" strong>
                  <MoneyAmount value={data.customerTotal} currency={data.currency} />
                </Row>
                {data.exchangeRate ? (
                  <Row label="سعر الصرف المثبّت">
                    <SypAmount value={data.exchangeRate} />
                  </Row>
                ) : null}
                <Row label="الإيراد بالدولار">{usd(money.revenueUsd)}</Row>
                <Row label="تكلفة البضاعة">{usd(money.cogsUsd)}</Row>
                <Row label="أجرة التوصيل">{usd(money.deliveryCostUsd)}</Row>
                {data.status === "VOIDED" ? null : (
                  <Row label={PROFIT_LABEL[data.status]} strong>
                    {usd(money.profitUsd, money.profitUsd < 0 ? "text-red" : undefined)}
                  </Row>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الزبون والتوصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-2 small">
                <Row label="الاسم">{data.customer.name ?? "—"}</Row>
                {data.customer.phone ? (
                  <Row label="الهاتف">
                    <a href={`tel:${data.customer.phone}`} dir="ltr" className="hover:text-blue hover:underline">
                      {data.customer.phone}
                    </a>
                  </Row>
                ) : null}
                {data.customer.address ? <Row label="العنوان">{data.customer.address}</Row> : null}
                <Row label="شركة التوصيل">{data.deliveryCompany?.name ?? "—"}</Row>
                {data.deliveryCost > 0 && data.deliveryCostCurrency ? (
                  <Row label="أجرة الشركة">
                    <MoneyAmount value={data.deliveryCost} currency={data.deliveryCostCurrency} />
                  </Row>
                ) : null}
              </dl>
              {data.notes ? <p className="mt-4 small whitespace-pre-line text-muted-foreground">{data.notes}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { PackageX } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { FormPageHeader } from "@/components/common/form-page-header"
import { StatTile } from "@/components/common/stat-tile"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, toUserMessage } from "@/lib/api/errors"
import { formatDate, formatMoney, formatQuantity, formatUnitCost } from "@/lib/format"
import { useProductStock } from "../api/stock"
import type { ProductStock } from "../types"
import { StockStatusBadge } from "./stock-status-badge"

const ORDER_STATUS = {
  PENDING: { label: "قيد التوصيل", variant: "info" },
  DELIVERED: { label: "تم التسليم", variant: "secondary" },
  RETURNED: { label: "مرتجع", variant: "outline" },
  VOIDED: { label: "ملغى", variant: "destructive" },
} as const

const lotColumns: DataTableColumn<ProductStock["lots"][number]>[] = [
  {
    id: "invoice",
    header: "الدفعة",
    className: "whitespace-normal!",
    cell: (l) => (
      <div className="flex flex-col gap-0.5">
        <Link href={`/purchasing/invoices/${l.invoiceId}`} dir="ltr" className="w-fit font-semibold text-foreground hover:text-blue hover:underline">
          {l.invoiceNumber}
        </Link>
        {/* Separate elements: a Latin supplier name and the date in one run come out in the wrong order. */}
        <span className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
          <span>{formatDate(`${l.invoiceDate}T00:00:00`)}</span>
          {l.supplierName ? <span dir="auto">{l.supplierName}</span> : null}
        </span>
      </div>
    ),
  },
  { id: "cost", header: "التكلفة الواصلة", cell: (l) => <span dir="ltr">{formatUnitCost(l.unitCost)}</span> },
  { id: "in", header: "دخل", className: "hidden sm:table-cell", cell: (l) => formatQuantity(l.qtyIn) },
  {
    id: "left",
    header: "بقي",
    align: "end",
    cell: (l) =>
      l.qtyLeft === 0 ? <Badge variant="outline">نفدت</Badge> : <span className="font-semibold text-foreground">{formatQuantity(l.qtyLeft)}</span>,
  },
]

const orderColumns: DataTableColumn<ProductStock["recentOrders"][number]>[] = [
  {
    id: "order",
    header: "الطلب",
    cell: (o) => (
      <div className="flex flex-col gap-0.5">
        <Link href={`/sales/orders/${o.orderId}`} dir="ltr" className="w-fit font-semibold text-foreground hover:text-blue hover:underline">
          {o.orderNumber}
        </Link>
        <span className="text-xs text-muted-foreground">{formatDate(o.orderedAt)}</span>
      </div>
    ),
  },
  { id: "status", header: "الحالة", cell: (o) => <Badge variant={ORDER_STATUS[o.status].variant}>{ORDER_STATUS[o.status].label}</Badge> },
  { id: "qty", header: "الكمية", className: "hidden sm:table-cell", cell: (o) => formatQuantity(o.quantity) },
  {
    id: "cost",
    header: "تكلفة القطعة",
    align: "end",
    cell: (o) => (o.unitCost != null ? <span dir="ltr">{formatUnitCost(o.unitCost)}</span> : "—"),
  },
]

export function ProductStockView({ productId }: { productId: string }) {
  const stock = useProductStock(productId)

  if (stock.isPending) return <Skeleton className="h-96 w-full" />
  if (stock.isError) {
    if (stock.error instanceof ApiError && stock.error.status === 404) {
      return (
        <EmptyState
          icon={PackageX}
          title="المنتج غير موجود"
          action={
            <ButtonLink variant="outline" href="/inventory">
              العودة إلى المخزون
            </ButtonLink>
          }
        />
      )
    }
    return <Alert>{toUserMessage(stock.error)}</Alert>
  }

  const { summary, lots, recentOrders, lowStockThreshold } = stock.data
  const avgCost = summary.available > 0 ? summary.valueUsd / summary.available : null

  return (
    <div className="flex flex-col gap-6">
      <FormPageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {summary.name}
            <StockStatusBadge item={summary} />
          </span>
        }
        backHref="/inventory"
        backLabel="المخزون"
        actions={
          <ButtonLink variant="outline" href={`/catalog/products/${productId}`}>
            صفحة المنتج
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="في المستودع"
          value={formatQuantity(summary.available)}
          tone={summary.low ? "negative" : "default"}
          hint={summary.low ? `أقل من ${formatQuantity(lowStockThreshold)}: وقت الشراء` : undefined}
        />
        <StatTile label="مع الزبائن" value={formatQuantity(summary.inTransit)} hint="في طلبات قيد التوصيل" />
        <StatTile label="قيمة المستودع" value={<span dir="ltr">{formatMoney(summary.valueUsd)}</span>} />
        <StatTile
          label="متوسط التكلفة الواصلة"
          value={avgCost != null ? <span dir="ltr">{formatUnitCost(avgCost)}</span> : "—"}
          hint={
            <>
              سعر البيع <span dir="ltr">{formatMoney(summary.sellingPrice)}</span>
            </>
          }
        />
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="lots-title">
        <h2 id="lots-title" className="h3">
          الدفعات
        </h2>
        <p className="small text-muted-foreground">الأقدم أولاً: كل بيع يأخذ من أقدم دفعة فيها كمية (FIFO)، فيُحسب الربح على تكلفتها.</p>
        {lots.length === 0 ? (
          <p className="rounded-md border border-dashed bg-card px-4 py-6 text-center small text-muted-foreground">لم يُشترَ هذا المنتج بعد.</p>
        ) : (
          <DataTable caption="دفعات المنتج" columns={lotColumns} rows={lots} getRowId={(l) => l.id} />
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="orders-title">
        <h2 id="orders-title" className="h3">
          آخر الطلبات
        </h2>
        {recentOrders.length === 0 ? (
          <p className="rounded-md border border-dashed bg-card px-4 py-6 text-center small text-muted-foreground">لا طلبات على هذا المنتج بعد.</p>
        ) : (
          <DataTable caption="آخر طلبات المنتج" columns={orderColumns} rows={recentOrders} getRowId={(o) => o.orderId} />
        )}
      </section>
    </div>
  )
}

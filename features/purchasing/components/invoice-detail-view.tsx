"use client"

import type { ReactNode } from "react"
import { FileX } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { FormPageHeader } from "@/components/common/form-page-header"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError, toUserMessage } from "@/lib/api/errors"
import { formatDate, formatMoney, formatQuantity, formatUnitCost } from "@/lib/format"
import { useInvoice } from "../api/invoices"
import type { InvoiceItem } from "../types"
import { InvoiceAttachmentCard } from "./invoice-attachment-card"
import { InvoiceDetailSkeleton } from "./invoice-detail-skeleton"
import { PaidFromBadge } from "./paid-from-badge"

const money = (value: number) => <span dir="ltr">{formatMoney(value)}</span>

const columns: DataTableColumn<InvoiceItem>[] = [
  {
    id: "product",
    header: "المنتج",
    // Long names wrap, so the table fits a phone screen without scrolling sideways.
    className: "whitespace-normal!",
    cell: (item) => (
      <div className="flex min-w-0 flex-col">
        <span className="font-semibold text-foreground">{item.product.name}</span>
        <span className="text-xs text-muted-foreground sm:hidden">
          {formatQuantity(item.quantity)} × <span dir="ltr">{formatUnitCost(item.unitPriceUsd)}</span>
        </span>
      </div>
    ),
  },
  { id: "qty", header: "الكمية", className: "hidden sm:table-cell", cell: (item) => formatQuantity(item.quantity) },
  {
    id: "price",
    header: "سعر القطعة",
    className: "hidden sm:table-cell",
    cell: (item) => <span dir="ltr">{formatUnitCost(item.unitPriceUsd)}</span>,
  },
  { id: "extra", header: "حصة الشحن", className: "hidden md:table-cell", cell: (item) => money(item.extraCostUsd) },
  {
    id: "landed",
    header: "التكلفة الواصلة",
    // Wraps to two lines on phones instead of being clipped.
    className: "whitespace-normal!",
    align: "end",
    cell: (item) => (
      <span dir="ltr" className="font-semibold text-foreground">
        {formatUnitCost(item.landedUnitCost)}
      </span>
    ),
  },
  { id: "total", header: "المجموع", className: "hidden lg:table-cell", align: "end", cell: (item) => money(item.lineTotalUsd) },
]

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-4 border-t pt-2 font-semibold text-foreground" : "flex justify-between gap-4"}>
      <dt className={strong ? undefined : "text-muted-foreground"}>{label}</dt>
      <dd className="text-end">{children}</dd>
    </div>
  )
}

export function InvoiceDetailView({ invoiceId }: { invoiceId: string }) {
  const invoice = useInvoice(invoiceId)

  if (invoice.isPending) return <InvoiceDetailSkeleton />

  if (invoice.isError) {
    if (invoice.error instanceof ApiError && invoice.error.status === 404) {
      return (
        <EmptyState
          icon={FileX}
          title="الفاتورة غير موجودة"
          action={
            <ButtonLink variant="outline" href="/purchasing/invoices">
              العودة إلى الفواتير
            </ButtonLink>
          }
        />
      )
    }
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert>{toUserMessage(invoice.error)}</Alert>
        <Button variant="outline" onClick={() => invoice.refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  const data = invoice.data
  return (
    <div className="flex flex-col gap-6">
      <FormPageHeader title={<span dir="ltr">{data.invoiceNumber}</span>} backHref="/purchasing/invoices" backLabel="فواتير الشراء" />

      {/* Summary first, then the full-width items table: six columns need the whole page width. */}
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <Card>
          <CardHeader>
            <CardTitle>الملخص</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2 small">
              <Row label="المورد">{data.supplier?.name ?? "بدون مورد"}</Row>
              <Row label="التاريخ">{formatDate(data.invoiceDate)}</Row>
              <Row label="مصدر الدفع">
                <PaidFromBadge paidFrom={data.paidFrom} />
              </Row>
              <Row label="قيمة البضاعة">{money(data.itemsTotalUsd)}</Row>
              <Row label="الشحن">{money(data.shippingCostUsd)}</Row>
              {data.customsCostUsd > 0 ? <Row label="جمارك وتخليص">{money(data.customsCostUsd)}</Row> : null}
              <Row label="الإجمالي" strong>
                {money(data.totalUsd)}
              </Row>
            </dl>
            {data.notes ? <p className="mt-4 small whitespace-pre-line text-muted-foreground">{data.notes}</p> : null}
          </CardContent>
        </Card>
        <InvoiceAttachmentCard invoiceId={data.id} hasAttachment={data.hasAttachment} />
      </div>

      <section className="flex min-w-0 flex-col gap-3" aria-labelledby="invoice-items-title">
        <h2 id="invoice-items-title" className="h3">
          البنود
        </h2>
        <DataTable caption="بنود الفاتورة" columns={columns} rows={data.items} getRowId={(item) => item.id} />
      </section>
    </div>
  )
}

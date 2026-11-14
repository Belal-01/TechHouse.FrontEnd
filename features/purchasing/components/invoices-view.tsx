"use client"

import Link from "next/link"
import { FileText, Plus, ReceiptText, SearchX } from "lucide-react"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { PaginationBar } from "@/components/common/pagination-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toUserMessage } from "@/lib/api/errors"
import { formatDate, formatMoney, formatQuantity } from "@/lib/format"
import { useInvoices } from "../api/invoices"
import { STATUS_LABELS } from "../lib/invoice-form"
import type { InvoiceStatus, InvoiceSummary } from "../types"
import { InvoiceStatusBadge } from "./invoice-status-badge"
import { NO_SUPPLIER, SupplierSelect } from "./supplier-select"

const PAGE_SIZE = 20

// Filter and page live in the URL, so reload, back/forward and shared links keep them.
const filterParsers = {
  supplier: parseAsString.withDefault(NO_SUPPLIER),
  status: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
}

const STATUS_FILTER_ITEMS = [
  { value: "", label: "كل الحالات" },
  ...(Object.keys(STATUS_LABELS) as InvoiceStatus[]).map((value) => ({ value, label: STATUS_LABELS[value] })),
]

const columns: DataTableColumn<InvoiceSummary>[] = [
  {
    id: "number",
    header: "الفاتورة",
    cell: (invoice) => (
      <div className="flex flex-col">
        <Link
          href={`/purchasing/invoices/${invoice.id}`}
          dir="ltr"
          className="w-fit font-semibold text-foreground hover:text-blue hover:underline"
        >
          {invoice.invoiceNumber}
        </Link>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {formatDate(invoice.invoiceDate)}
          <InvoiceStatusBadge status={invoice.status} voided={invoice.voided} />
          {invoice.unassigned ? <Badge variant="outline">ممول غير محدد</Badge> : null}
        </span>
      </div>
    ),
  },
  {
    id: "supplier",
    header: "المورد",
    className: "hidden sm:table-cell",
    cell: (invoice) => invoice.supplier?.name ?? <span className="text-muted-foreground">بدون مورد</span>,
  },
  {
    id: "items",
    header: "البنود",
    className: "hidden md:table-cell",
    cell: (invoice) => formatQuantity(invoice.itemCount),
  },
  {
    id: "total",
    header: "الإجمالي",
    align: "end",
    cell: (invoice) => (
      <span className="inline-flex items-center gap-2">
        {invoice.hasAttachment ? (
          <FileText className="size-4 text-muted-foreground" aria-label="مرفق PDF" role="img" />
        ) : null}
        <span dir="ltr" className={invoice.voided ? "text-muted-foreground line-through" : "font-semibold"}>
          {formatMoney(invoice.totalUsd)}
        </span>
      </span>
    ),
  },
]

export function InvoicesView() {
  const [filters, setFilters] = useQueryStates(filterParsers)
  const invoices = useInvoices({
    supplierId: filters.supplier || null,
    status: (filters.status || null) as InvoiceStatus | null,
    page: Math.max(filters.page - 1, 0),
    size: PAGE_SIZE,
  })
  const page = invoices.data
  const hasFilters = filters.supplier !== NO_SUPPLIER || filters.status !== ""

  const addButton = (variant: "default" | "outline") => (
    <ButtonLink variant={variant} href="/purchasing/invoices/new">
      <Plus aria-hidden />
      فاتورة جديدة
    </ButtonLink>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="فواتير الشراء"
        description="البضاعة التي اشتريتها: في الطريق أو وصلت، بتكلفتها الواصلة بعد الشحن والجمارك."
        actions={addButton("default")}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SupplierSelect
          aria-label="المورد"
          className="w-full sm:w-64"
          emptyLabel="كل الموردين"
          value={filters.supplier}
          onValueChange={(supplier) => setFilters({ supplier, page: 1 })}
        />
        <Select items={STATUS_FILTER_ITEMS} value={filters.status} onValueChange={(status) => setFilters({ status: status ?? "", page: 1 })}>
          <SelectTrigger aria-label="الحالة" className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_ITEMS.map((item) => (
              <SelectItem key={item.value || "all"} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        caption="قائمة فواتير الشراء"
        columns={columns}
        rows={page?.content}
        getRowId={(invoice) => invoice.id}
        isLoading={invoices.isPending}
        loadingRows={8}
        error={invoices.isError ? toUserMessage(invoices.error) : null}
        onRetry={() => invoices.refetch()}
        className={invoices.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
        empty={
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="لا توجد فواتير بهذه الفلاتر"
              action={
                <Button variant="outline" onClick={() => setFilters({ supplier: NO_SUPPLIER, status: "", page: 1 })}>
                  عرض كل الفواتير
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="لا توجد فواتير شراء بعد"
              description="أدخل أول فاتورة لتُضاف بضاعتها إلى المخزون بتكلفتها الحقيقية."
              action={addButton("outline")}
            />
          )
        }
      />

      {page ? (
        <PaginationBar
          page={page.page}
          pageSize={page.size}
          totalElements={page.totalElements}
          totalPages={page.totalPages}
          onPageChange={(next) => setFilters({ page: next + 1 })}
        />
      ) : null}
    </div>
  )
}

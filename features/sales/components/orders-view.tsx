"use client"

import Link from "next/link"
import { Plus, SearchX, ShoppingCart } from "lucide-react"
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { MoneyAmount } from "@/components/common/money-amount"
import { PageHeader } from "@/components/common/page-header"
import { PaginationBar } from "@/components/common/pagination-bar"
import { SearchInput } from "@/components/common/search-input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { toUserMessage } from "@/lib/api/errors"
import { formatDate, formatMoney } from "@/lib/format"
import { useOrders } from "../api/orders"
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "../lib/order-status"
import type { OrderSummary } from "../types"
import { OrderStatusBadge } from "./order-status-badge"

const PAGE_SIZE = 20
const STATUS_FILTERS = ["all", ...ORDER_STATUSES] as const
const STATUS_ITEMS = [{ value: "all", label: "كل الحالات" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }))]

const filterParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(STATUS_FILTERS).withDefault("all"),
  page: parseAsInteger.withDefault(1),
}

const columns: DataTableColumn<OrderSummary>[] = [
  {
    id: "number",
    header: "الطلب",
    cell: (order) => (
      <div className="flex flex-col">
        <Link href={`/sales/orders/${order.id}`} dir="ltr" className="w-fit font-semibold text-foreground hover:text-blue hover:underline">
          {order.orderNumber}
        </Link>
        <span className="text-xs text-muted-foreground">{formatDate(order.orderedAt)}</span>
      </div>
    ),
  },
  {
    id: "customer",
    header: "الزبون",
    className: "hidden sm:table-cell",
    cell: (order) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate">{order.customerName ?? "—"}</span>
        {order.customerPhone ? (
          <span dir="ltr" className="w-fit text-xs text-muted-foreground">
            {order.customerPhone}
          </span>
        ) : null}
      </div>
    ),
  },
  { id: "status", header: "الحالة", cell: (order) => <OrderStatusBadge status={order.status} /> },
  {
    id: "profit",
    header: "الربح",
    className: "hidden md:table-cell",
    cell: (order) =>
      order.status === "VOIDED" ? (
        "—"
      ) : (
        <span dir="ltr" className={order.money.profitUsd < 0 ? "text-red" : undefined}>
          {formatMoney(order.money.profitUsd)}
        </span>
      ),
  },
  {
    id: "total",
    header: "المبلغ",
    align: "end",
    cell: (order) => <MoneyAmount value={order.customerTotal} currency={order.currency} className="font-semibold" />,
  },
]

export function OrdersView() {
  const [filters, setFilters] = useQueryStates(filterParsers)
  const debouncedSearch = useDebouncedValue(filters.q, 300)
  const orders = useOrders({
    status: filters.status === "all" ? null : filters.status,
    search: debouncedSearch,
    page: Math.max(filters.page - 1, 0),
    size: PAGE_SIZE,
  })
  const page = orders.data
  const hasFilters = filters.q !== "" || filters.status !== "all"
  const clear = () => setFilters({ q: "", status: "all", page: 1 })

  const addButton = (variant: "default" | "outline") => (
    <ButtonLink variant={variant} href="/sales/orders/new">
      <Plus aria-hidden />
      طلب جديد
    </ButtonLink>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="الطلبات" description="كل طلب يُسجَّل لحظة خروجه، ثم يُعلَّم: تم التسليم أو مرتجع." actions={addButton("default")} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          label="بحث في الطلبات"
          placeholder="ابحث برقم الطلب أو اسم الزبون أو هاتفه"
          value={filters.q}
          onValueChange={(q) => setFilters({ q, page: 1 })}
          className="md:max-w-sm md:flex-1"
        />
        <Select items={STATUS_ITEMS} value={filters.status} onValueChange={(status) => setFilters({ status: status ?? "all", page: 1 })}>
          <SelectTrigger aria-label="الحالة" className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button variant="ghost" onClick={clear}>
            مسح الفلاتر
          </Button>
        ) : null}
      </div>

      <DataTable
        caption="قائمة الطلبات"
        columns={columns}
        rows={page?.content}
        getRowId={(order) => order.id}
        isLoading={orders.isPending}
        loadingRows={8}
        error={orders.isError ? toUserMessage(orders.error) : null}
        onRetry={() => orders.refetch()}
        className={orders.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
        empty={
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="لا توجد نتائج"
              description="لا يوجد طلب يطابق البحث أو الحالة."
              action={
                <Button variant="outline" onClick={clear}>
                  مسح الفلاتر
                </Button>
              }
            />
          ) : (
            <EmptyState icon={ShoppingCart} title="لا توجد طلبات بعد" description="أدخل أول طلب عند خروجه من عندك." action={addButton("outline")} />
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

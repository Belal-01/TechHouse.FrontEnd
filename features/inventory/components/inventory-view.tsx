"use client"

import Link from "next/link"
import { SearchX, Warehouse } from "lucide-react"
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { SearchInput } from "@/components/common/search-input"
import { StatTile } from "@/components/common/stat-tile"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toUserMessage } from "@/lib/api/errors"
import { formatMoney, formatQuantity } from "@/lib/format"
import { useStock } from "../api/stock"
import type { StockItem } from "../types"
import { StockStatusBadge } from "./stock-status-badge"

const FILTERS = ["all", "available", "low", "out"] as const
type Filter = (typeof FILTERS)[number]
const FILTER_ITEMS: { value: Filter; label: string }[] = [
  { value: "all", label: "كل المنتجات" },
  { value: "available", label: "متوفر" },
  { value: "low", label: "قارب على النفاد" },
  { value: "out", label: "نفد" },
]
const MATCHES: Record<Filter, (s: StockItem) => boolean> = {
  all: () => true,
  available: (s) => s.available > 0,
  low: (s) => s.low && s.available > 0,
  out: (s) => s.stocked && s.available === 0,
}

const parsers = { q: parseAsString.withDefault(""), filter: parseAsStringLiteral(FILTERS).withDefault("all") }

const usd = (value: number) => <span dir="ltr">{formatMoney(value)}</span>

const columns: DataTableColumn<StockItem>[] = [
  {
    id: "product",
    header: "المنتج",
    className: "whitespace-normal!",
    cell: (s) => (
      <div className="flex min-w-0 flex-col gap-1">
        <Link href={`/inventory/${s.productId}`} className="w-fit font-semibold text-foreground hover:text-blue hover:underline">
          {s.name}
        </Link>
        <span className="flex flex-wrap items-center gap-2">
          {s.sku ? (
            <span dir="ltr" className="text-xs text-muted-foreground">
              {s.sku}
            </span>
          ) : null}
          <StockStatusBadge item={s} />
        </span>
      </div>
    ),
  },
  { id: "available", header: "في المستودع", cell: (s) => <span className="font-semibold text-foreground">{formatQuantity(s.available)}</span> },
  {
    id: "transit",
    header: "مع الزبائن",
    className: "hidden sm:table-cell",
    cell: (s) => (s.inTransit > 0 ? formatQuantity(s.inTransit) : <span className="text-muted-foreground">—</span>),
  },
  { id: "value", header: "القيمة", align: "end", cell: (s) => usd(s.valueUsd + s.inTransitValueUsd) },
]

export function InventoryView() {
  const [state, setState] = useQueryStates(parsers)
  const stock = useStock()
  const all = stock.data ?? []
  const term = state.q.trim().toLowerCase()
  const rows = all.filter(
    (s) => MATCHES[state.filter](s) && (!term || s.name.toLowerCase().includes(term) || (s.sku ?? "").toLowerCase().includes(term)),
  )
  const warehouse = all.reduce((sum, s) => sum + s.valueUsd, 0)
  const transit = all.reduce((sum, s) => sum + s.inTransitValueUsd, 0)
  const units = all.reduce((sum, s) => sum + s.available, 0)
  const lowCount = all.filter((s) => s.low).length
  const hasFilters = state.q !== "" || state.filter !== "all"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="المخزون" description="ما في المستودع ومع الزبائن، بالتكلفة الواصلة. تزيد الكميات بفواتير الشراء وتنقص بالطلبات." />

      {stock.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="قيمة المستودع" value={usd(warehouse)} hint={<>{formatQuantity(units)} قطعة</>} />
          <StatTile label="مع الزبائن" value={usd(transit)} hint="طلبات قيد التوصيل" href="/sales/orders?status=PENDING" />
          <StatTile label="المجموع" value={usd(warehouse + transit)} tone="accent" />
          <StatTile
            label="قارب على النفاد أو نفد"
            value={formatQuantity(lowCount)}
            tone={lowCount > 0 ? "negative" : "default"}
            hint={lowCount > 0 ? "منتجات تحتاج شراء" : "لا شيء"}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          label="بحث في المخزون"
          placeholder="ابحث بالاسم أو الرمز"
          value={state.q}
          onValueChange={(q) => setState({ q })}
          className="md:max-w-sm md:flex-1"
        />
        <Select items={FILTER_ITEMS} value={state.filter} onValueChange={(filter) => setState({ filter: (filter as Filter) ?? "all" })}>
          <SelectTrigger aria-label="الحالة" className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button variant="ghost" onClick={() => setState({ q: "", filter: "all" })}>
            مسح الفلاتر
          </Button>
        ) : null}
      </div>

      <DataTable
        caption="المخزون حسب المنتج"
        columns={columns}
        rows={stock.isPending ? undefined : rows}
        getRowId={(s) => s.productId}
        isLoading={stock.isPending}
        loadingRows={8}
        error={stock.isError ? toUserMessage(stock.error) : null}
        onRetry={() => stock.refetch()}
        empty={
          hasFilters ? (
            <EmptyState icon={SearchX} title="لا توجد نتائج" description="لا يوجد منتج يطابق البحث أو الفلتر." />
          ) : (
            <EmptyState icon={Warehouse} title="لا توجد منتجات بعد" description="أضف المنتجات ثم أدخل فاتورة شراء لتظهر كمياتها هنا." />
          )
        }
      />
    </div>
  )
}

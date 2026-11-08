"use client"

import { useState } from "react"
import { PickerDialog } from "@/components/common/picker-dialog"
import { Badge } from "@/components/ui/badge"
import { useStock, type StockItem } from "@/features/inventory"
import { toUserMessage } from "@/lib/api/errors"
import { formatQuantity } from "@/lib/format"

type StockPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: StockItem) => void
}

/** Pick a product to sell, with what is in stock. Out-of-stock and stopped products can't be picked. */
export function StockPickerDialog({ open, onOpenChange, onSelect }: StockPickerDialogProps) {
  const [search, setSearch] = useState("")
  const stock = useStock()
  const term = search.trim().toLowerCase()
  const items = stock.data
    ?.filter((item) => !term || item.name.toLowerCase().includes(term) || (item.sku ?? "").toLowerCase().includes(term))
    .sort((a, b) => Number(b.available > 0) - Number(a.available > 0))

  return (
    <PickerDialog
      open={open}
      onOpenChange={onOpenChange}
      title="اختر منتجاً"
      description="المنتجات بلا كمية في المخزون لا يمكن بيعها؛ أدخل فاتورة شراء لها أولاً."
      searchLabel="ابحث بالاسم أو الرمز"
      search={search}
      onSearchChange={setSearch}
      items={items}
      isLoading={stock.isPending}
      error={stock.isError ? toUserMessage(stock.error) : null}
      emptyText="لا توجد منتجات مطابقة."
      getKey={(item) => item.productId}
      isDisabled={(item) => item.available <= 0 || !item.active}
      onSelect={onSelect}
      renderItem={(item) => (
        <>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-foreground">{item.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {item.sku ? <span dir="ltr">{item.sku}</span> : "بدون رمز"}
            </span>
          </span>
          {!item.active ? (
            <Badge variant="outline">موقوف</Badge>
          ) : item.available > 0 ? (
            <span className="shrink-0 small text-muted-foreground">متوفر {formatQuantity(item.available)}</span>
          ) : (
            <Badge variant="destructive">نفد</Badge>
          )}
        </>
      )}
    />
  )
}

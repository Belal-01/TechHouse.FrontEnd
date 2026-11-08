"use client"

import { useState } from "react"
import { PickerDialog } from "@/components/common/picker-dialog"
import { Badge } from "@/components/ui/badge"
import { useProducts } from "@/features/catalog"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { toUserMessage } from "@/lib/api/errors"

export type PickedProduct = { id: string; name: string; sku: string }

type ProductPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: PickedProduct) => void
}

/** Search the catalog and pick one product. Remount (key) per opening to start with an empty search. */
export function ProductPickerDialog({ open, onOpenChange, onSelect }: ProductPickerDialogProps) {
  const [search, setSearch] = useState("")
  const debounced = useDebouncedValue(search, 250)
  const products = useProducts({ search: debounced, categoryId: null, active: null, page: 0, size: 20 })

  return (
    <PickerDialog
      open={open}
      onOpenChange={onOpenChange}
      title="اختر منتجاً"
      description="ابحث بالاسم أو الرمز أو الباركود. المنتج غير الموجود أضفه أولاً من صفحة المنتجات."
      searchLabel="ابحث عن منتج"
      search={search}
      onSearchChange={setSearch}
      items={products.data?.content}
      isLoading={products.isPending}
      error={products.isError ? toUserMessage(products.error) : null}
      emptyText="لا توجد منتجات مطابقة."
      getKey={(product) => product.id}
      onSelect={(product) => onSelect({ id: product.id, name: product.name, sku: product.sku ?? "" })}
      renderItem={(product) => (
        <>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-foreground">{product.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {product.sku ? <span dir="ltr">{product.sku}</span> : "بدون رمز"}
            </span>
          </span>
          {product.active ? null : <Badge variant="outline">موقوف</Badge>}
        </>
      )}
    />
  )
}

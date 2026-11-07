"use client"

import { useState } from "react"
import { PackageSearch } from "lucide-react"
import { SearchInput } from "@/components/common/search-input"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
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
  const rows = products.data?.content ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>اختر منتجاً</DialogTitle>
          <DialogDescription>ابحث بالاسم أو الرمز أو الباركود. المنتج غير الموجود أضفه أولاً من صفحة المنتجات.</DialogDescription>
        </DialogHeader>
        <SearchInput label="بحث عن منتج" placeholder="ابحث عن منتج" value={search} onValueChange={setSearch} autoFocus />

        <div className="-mx-2 min-h-40 overflow-y-auto px-2" aria-live="polite" aria-busy={products.isFetching || undefined}>
          {products.isError ? (
            <Alert>{toUserMessage(products.error)}</Alert>
          ) : products.isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center small text-muted-foreground">
              <PackageSearch className="size-6" aria-hidden />
              لا توجد منتجات مطابقة.
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {rows.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-start transition-colors hover:bg-muted"
                    onClick={() => onSelect({ id: product.id, name: product.name, sku: product.sku ?? "" })}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-foreground">{product.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {product.sku ? <span dir="ltr">{product.sku}</span> : "بدون رمز"}
                      </span>
                    </span>
                    {product.active ? null : <Badge variant="outline">موقوف</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

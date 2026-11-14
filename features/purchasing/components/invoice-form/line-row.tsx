"use client"

import { useFormContext } from "react-hook-form"
import { Package, Trash2 } from "lucide-react"
import { PriceInput } from "@/components/common/price-input"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { fieldA11y } from "@/lib/field-a11y"
import { formatMoney, formatUnitCost } from "@/lib/format"
import type { LineCost } from "../../lib/landed-cost"
import type { InvoiceFormValues } from "../../schemas/invoice.schema"

type LineRowProps = {
  index: number
  cost: LineCost | null
  onChangeProduct: () => void
  onRemove: () => void
}

export function LineRow({ index, cost, onChangeProduct, onRemove }: LineRowProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>()
  const lineErrors = errors.items?.[index]
  const name = watch(`items.${index}.productName`)
  const sku = watch(`items.${index}.productSku`)
  const id = (field: string) => `invoice-line-${index}-${field}`

  return (
    <li className="flex flex-col gap-3 rounded-md border p-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_9rem] sm:items-start">
        <FormField id={id("product")} label="المنتج" error={lineErrors?.productId?.message}>
          <Button
            id={id("product")}
            type="button"
            variant="outline"
            className="h-auto min-h-9 w-full justify-start py-1.5 text-start"
            onClick={onChangeProduct}
            {...fieldA11y(id("product"), lineErrors?.productId)}
          >
            <Package className="text-muted-foreground" aria-hidden />
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{name || "اختر منتجاً"}</span>
              {sku ? (
                <span dir="ltr" className="truncate text-start text-xs text-muted-foreground">
                  {sku}
                </span>
              ) : null}
            </span>
          </Button>
        </FormField>
        <FormField id={id("qty")} label="الكمية" error={lineErrors?.quantity?.message}>
          <Input
            id={id("qty")}
            inputMode="numeric"
            dir="ltr"
            className="text-end"
            {...fieldA11y(id("qty"), lineErrors?.quantity)}
            {...register(`items.${index}.quantity`)}
          />
        </FormField>
        <FormField id={id("price")} label="سعر القطعة" error={lineErrors?.unitPriceUsd?.message}>
          <PriceInput id={id("price")} {...fieldA11y(id("price"), lineErrors?.unitPriceUsd)} {...register(`items.${index}.unitPriceUsd`)} />
        </FormField>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <dl className="flex flex-wrap gap-x-5 gap-y-1 small">
          <div className="flex gap-1">
            <dt className="text-muted-foreground">المجموع:</dt>
            <dd dir="ltr">{cost ? formatMoney(cost.lineValue) : "—"}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-muted-foreground">حصة التكاليف:</dt>
            <dd dir="ltr">{cost ? formatMoney(cost.extra) : "—"}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-muted-foreground">التكلفة الواصلة للقطعة:</dt>
            <dd dir="ltr" className="font-semibold text-foreground">
              {cost ? formatUnitCost(cost.landedUnitCost) : "—"}
            </dd>
          </div>
        </dl>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`حذف البند ${index + 1}${name ? `: ${name}` : ""}`}>
          <Trash2 aria-hidden />
          حذف
        </Button>
      </div>
    </li>
  )
}

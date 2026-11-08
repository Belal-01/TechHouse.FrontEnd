"use client"

import { useFormContext } from "react-hook-form"
import { Package, Trash2 } from "lucide-react"
import { MoneyAmount } from "@/components/common/money-amount"
import { PriceInput } from "@/components/common/price-input"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { fieldA11y } from "@/lib/field-a11y"
import { formatQuantity } from "@/lib/format"
import type { OrderFormValues } from "../../schemas/order.schema"

type LineRowProps = {
  index: number
  onChangeProduct: () => void
  onRemove: () => void
}

export function LineRow({ index, onChangeProduct, onRemove }: LineRowProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<OrderFormValues>()
  const lineErrors = errors.items?.[index]
  const [name, sku, available, quantity, unitPrice, currency] = watch([
    `items.${index}.productName`,
    `items.${index}.productSku`,
    `items.${index}.available`,
    `items.${index}.quantity`,
    `items.${index}.unitPrice`,
    "currency",
  ])
  const id = (field: string) => `order-line-${index}-${field}`
  const lineTotal = Number(quantity) * Number(unitPrice)

  return (
    <li className="flex flex-col gap-3 rounded-md border p-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_6rem_10rem] sm:items-start">
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
              <span className="truncate">{name}</span>
              {/* Separate elements: mixing the Latin SKU and Arabic text in one run garbles their order. */}
              <span className="flex min-w-0 gap-2 text-xs text-muted-foreground">
                {sku ? (
                  <span dir="ltr" className="truncate">
                    {sku}
                  </span>
                ) : null}
                <span className="shrink-0">متوفر {formatQuantity(available)}</span>
              </span>
            </span>
          </Button>
        </FormField>
        <FormField id={id("qty")} label="الكمية" error={lineErrors?.quantity?.message}>
          <Input id={id("qty")} inputMode="numeric" dir="ltr" className="text-end" {...fieldA11y(id("qty"), lineErrors?.quantity)} {...register(`items.${index}.quantity`)} />
        </FormField>
        <FormField id={id("price")} label="سعر القطعة" error={lineErrors?.unitPrice?.message}>
          <PriceInput id={id("price")} currency={currency} {...fieldA11y(id("price"), lineErrors?.unitPrice)} {...register(`items.${index}.unitPrice`)} />
        </FormField>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <p className="small">
          <span className="text-muted-foreground">المجموع: </span>
          {Number.isFinite(lineTotal) && lineTotal > 0 ? <MoneyAmount value={lineTotal} currency={currency} className="font-semibold" /> : "—"}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`حذف البند ${index + 1}: ${name}`}>
          <Trash2 aria-hidden />
          حذف
        </Button>
      </div>
    </li>
  )
}

"use client"

import { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { PackagePlus, Plus } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StockItem } from "@/features/inventory"
import { defaultUnitPrice } from "../../lib/order-form"
import { MAX_ORDER_LINES, type OrderFormValues } from "../../schemas/order.schema"
import { StockPickerDialog } from "../stock-picker-dialog"
import { LineRow } from "./line-row"

type Picker = { open: boolean; target: number | null; session: number }

export function LinesCard({ sellRate }: { sellRate: number | null }) {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<OrderFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const [picker, setPicker] = useState<Picker>({ open: false, target: null, session: 0 })
  const openPicker = (target: number | null) => setPicker((s) => ({ open: true, target, session: s.session + 1 }))

  const onPick = (item: StockItem) => {
    setPicker((s) => ({ ...s, open: false }))
    const price = defaultUnitPrice(item.sellingPrice, getValues("currency"), sellRate)
    const line = { productId: item.productId, productName: item.name, productSku: item.sku ?? "", available: item.available }
    if (picker.target === null) {
      append({ ...line, quantity: "1", unitPrice: price }, { focusName: `items.${fields.length}.quantity` })
    } else {
      const options = { shouldDirty: true, shouldValidate: true }
      setValue(`items.${picker.target}`, { ...getValues(`items.${picker.target}`), ...line, unitPrice: price }, options)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>المنتجات</CardTitle>
        <CardDescription>يقترح النظام سعر البيع من صفحة المنتج، ويمكنك تعديله لهذا الطلب.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errors.items?.root?.message || errors.items?.message ? <Alert>{errors.items?.root?.message ?? errors.items?.message}</Alert> : null}
        {fields.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-8 text-center">
            <PackagePlus className="size-6 text-muted-foreground" aria-hidden />
            <p className="small text-muted-foreground">لم تُضف أي منتجات بعد.</p>
            <Button type="button" variant="outline" onClick={() => openPicker(null)}>
              <Plus aria-hidden />
              إضافة منتج
            </Button>
          </div>
        ) : (
          <>
            <ol className="flex flex-col gap-3" aria-label="منتجات الطلب">
              {fields.map((field, index) => (
                <LineRow key={field.id} index={index} onChangeProduct={() => openPicker(index)} onRemove={() => remove(index)} />
              ))}
            </ol>
            <Button type="button" variant="outline" className="self-start" disabled={fields.length >= MAX_ORDER_LINES} onClick={() => openPicker(null)}>
              <Plus aria-hidden />
              إضافة منتج
            </Button>
          </>
        )}
      </CardContent>
      <StockPickerDialog key={picker.session} open={picker.open} onOpenChange={(open) => setPicker((s) => ({ ...s, open }))} onSelect={onPick} />
    </Card>
  )
}

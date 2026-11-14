"use client"

import { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { PackagePlus, Plus } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LineCost } from "../../lib/landed-cost"
import { MAX_INVOICE_LINES, type InvoiceFormValues } from "../../schemas/invoice.schema"
import { ProductPickerDialog, type PickedProduct } from "../product-picker-dialog"
import { LineRow } from "./line-row"

// `target` = the line whose product is being changed, or null to add a new line.
type Picker = { open: boolean; target: number | null; session: number }

export function LinesCard({ costs }: { costs: (LineCost | null)[] }) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const [picker, setPicker] = useState<Picker>({ open: false, target: null, session: 0 })
  const openPicker = (target: number | null) => setPicker((s) => ({ open: true, target, session: s.session + 1 }))

  const onPick = (product: PickedProduct) => {
    setPicker((s) => ({ ...s, open: false }))
    if (picker.target === null) {
      append(
        { productId: product.id, productName: product.name, productSku: product.sku, quantity: "1", unitPriceUsd: "" },
        { focusName: `items.${fields.length}.unitPriceUsd` },
      )
    } else {
      const options = { shouldDirty: true, shouldValidate: true }
      setValue(`items.${picker.target}.productId`, product.id, options)
      setValue(`items.${picker.target}.productName`, product.name, options)
      setValue(`items.${picker.target}.productSku`, product.sku, options)
    }
  }

  const canAdd = fields.length < MAX_INVOICE_LINES

  return (
    <Card>
      <CardHeader>
        <CardTitle>البنود</CardTitle>
        <CardDescription>سعر القطعة كما في فاتورة المورد، قبل الشحن. التكلفة الواصلة تقديرية حتى تُضاف كل التكاليف.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errors.items?.root?.message || errors.items?.message ? (
          <Alert>{errors.items?.root?.message ?? errors.items?.message}</Alert>
        ) : null}

        {fields.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-8 text-center">
            <PackagePlus className="size-6 text-muted-foreground" aria-hidden />
            <p className="small text-muted-foreground">لم تُضف أي بنود بعد.</p>
            <Button type="button" variant="outline" onClick={() => openPicker(null)}>
              <Plus aria-hidden />
              إضافة منتج
            </Button>
          </div>
        ) : (
          <>
            <ol className="flex flex-col gap-3" aria-label="بنود الفاتورة">
              {fields.map((field, index) => (
                <LineRow
                  key={field.id}
                  index={index}
                  cost={costs[index] ?? null}
                  onChangeProduct={() => openPicker(index)}
                  onRemove={() => remove(index)}
                />
              ))}
            </ol>
            <Button type="button" variant="outline" className="self-start" disabled={!canAdd} onClick={() => openPicker(null)}>
              <Plus aria-hidden />
              إضافة منتج
            </Button>
          </>
        )}
      </CardContent>

      <ProductPickerDialog
        key={picker.session}
        open={picker.open}
        onOpenChange={(open) => setPicker((s) => ({ ...s, open }))}
        onSelect={onPick}
      />
    </Card>
  )
}

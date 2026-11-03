"use client"

import { useRef } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { buildVariants, emptyVariant, newOptionKey } from "../../lib/product-form"
import type { OptionFormValues, ProductFormValues, VariantFormValues } from "../../schemas/product.schema"
import type { ProductImage } from "../../types"
import { fieldA11y } from "./field-a11y"
import { OptionsEditor } from "./options-editor"
import { PriceInput } from "./price-input"
import { VariantsTable } from "./variants-table"

type Snapshot = { options: OptionFormValues[]; variants: VariantFormValues[] }

export function PricingCard({ images }: { images: ProductImage[] }) {
  const { control, getValues, setValue, register, formState } = useFormContext<ProductFormValues>()
  const { fields, replace } = useFieldArray({ control, name: "variants" })
  const hasVariants = useWatch({ control, name: "hasVariants" })
  const options = useWatch({ control, name: "options" })

  // Last state that still had variants. While an option has no values there are no combinations, so
  // regenerating from here keeps existing variants (ids, prices, SKUs) once values are added again.
  const lastWithVariants = useRef<Snapshot>({ options: getValues("options"), variants: getValues("variants") })

  const dirty = { shouldDirty: true, shouldValidate: formState.isSubmitted }

  const regenerate = (nextOptions: OptionFormValues[]) => {
    const current: Snapshot = { options: getValues("options"), variants: getValues("variants") }
    if (current.variants.length > 0) lastWithVariants.current = current
    const base = lastWithVariants.current
    setValue("options", nextOptions, dirty)
    replace(buildVariants(base.options, nextOptions, base.variants, base.variants[0]?.sellingPrice ?? ""))
  }

  const toggleVariants = (on: boolean) => {
    const variants = getValues("variants")
    const first = variants[0] ?? lastWithVariants.current.variants[0] ?? emptyVariant()
    setValue("hasVariants", on, dirty)
    if (on) {
      // The single variant becomes the template: it is kept as the first combination.
      lastWithVariants.current = { options: [], variants: [{ ...first, optionValues: [] }] }
      setValue("options", [{ key: newOptionKey(), name: "", values: [] }], dirty)
      replace([])
    } else {
      setValue("options", [], dirty)
      replace([{ ...first, optionValues: [] }])
    }
  }

  const errors = formState.errors.variants
  // Only after a save attempt: before that, the table's own hint explains what to do.
  const rootError = formState.isSubmitted ? (errors?.message ?? errors?.root?.message) : undefined
  const single = errors?.[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>الأنواع والأسعار</CardTitle>
        <CardDescription>الأسعار بالدولار. لكل نوع رمز وباركود وسعر خاص.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 rounded-md bg-muted p-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="product-has-variants">لهذا المنتج عدة أنواع</Label>
            <p className="small text-muted-foreground">مثل اللون أو السعة أو المقاس. لكل نوع سعره ومخزونه.</p>
          </div>
          <Switch id="product-has-variants" checked={hasVariants} onCheckedChange={toggleVariants} />
        </div>

        {hasVariants ? (
          <>
            <OptionsEditor options={options} onChange={regenerate} />
            <VariantsTable fields={fields} images={images} />
            {rootError ? <p className="small text-red" role="alert">{rootError}</p> : null}
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="variant-price" label="سعر البيع" error={single?.sellingPrice?.message}>
              <PriceInput id="variant-price" {...fieldA11y("variant-price", single?.sellingPrice)} {...register("variants.0.sellingPrice")} />
            </FormField>
            <FormField id="variant-sku" label="الرمز (SKU)" description="اختياري." error={single?.sku?.message}>
              <Input id="variant-sku" dir="ltr" maxLength={50} {...fieldA11y("variant-sku", single?.sku)} {...register("variants.0.sku")} />
            </FormField>
            <FormField id="variant-barcode" label="الباركود" description="اختياري." error={single?.barcode?.message}>
              <Input
                id="variant-barcode"
                dir="ltr"
                inputMode="numeric"
                maxLength={64}
                {...fieldA11y("variant-barcode", single?.barcode)}
                {...register("variants.0.barcode")}
              />
            </FormField>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

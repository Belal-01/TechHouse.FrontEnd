"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "../../schemas/product.schema"
import { fieldA11y } from "./field-a11y"
import { PriceInput } from "./price-input"

export function PricingCard() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>السعر والرموز</CardTitle>
        <CardDescription>السعر بالدولار. كل نوع من المنتج (لون، سعة...) يُضاف كمنتج مستقل.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <FormField id="product-price" label="سعر البيع" error={errors.sellingPrice?.message}>
          <PriceInput id="product-price" {...fieldA11y("product-price", errors.sellingPrice)} {...register("sellingPrice")} />
        </FormField>
        <FormField id="product-sku" label="الرمز (SKU)" description="اختياري." error={errors.sku?.message}>
          <Input id="product-sku" dir="ltr" maxLength={50} {...fieldA11y("product-sku", errors.sku)} {...register("sku")} />
        </FormField>
        <FormField id="product-barcode" label="الباركود" description="اختياري." error={errors.barcode?.message}>
          <Input
            id="product-barcode"
            dir="ltr"
            inputMode="numeric"
            maxLength={64}
            {...fieldA11y("product-barcode", errors.barcode)}
            {...register("barcode")}
          />
        </FormField>
      </CardContent>
    </Card>
  )
}

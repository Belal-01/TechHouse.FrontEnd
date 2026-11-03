"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ProductFormValues } from "../../schemas/product.schema"
import { fieldA11y } from "./field-a11y"

export function BasicInfoCard() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>المعلومات الأساسية</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField id="product-name" label="اسم المنتج" error={errors.name?.message}>
          <Input id="product-name" placeholder="مثال: iPhone 15" maxLength={255} {...fieldA11y("product-name", errors.name)} {...register("name")} />
        </FormField>
        <FormField
          id="product-description"
          label="الوصف"
          description="اختياري. يظهر للزبون لاحقاً في المتجر."
          error={errors.description?.message}
        >
          <Textarea id="product-description" maxLength={5000} {...fieldA11y("product-description", errors.description)} {...register("description")} />
        </FormField>
      </CardContent>
    </Card>
  )
}

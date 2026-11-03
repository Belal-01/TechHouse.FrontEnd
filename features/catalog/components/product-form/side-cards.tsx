"use client"

import { Controller, useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCategories } from "../../api/categories"
import type { ProductFormValues } from "../../schemas/product.schema"
import { fieldA11y } from "./field-a11y"

const NO_CATEGORY = ""

export function StatusCard() {
  const { control } = useFormContext<ProductFormValues>()
  return (
    <Card>
      <CardHeader>
        <CardTitle>الحالة</CardTitle>
      </CardHeader>
      <CardContent>
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="product-active">متاح للبيع</Label>
                <p className="small text-muted-foreground">المنتج الموقوف يبقى محفوظاً لكن لا يُباع.</p>
              </div>
              <Switch id="product-active" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </CardContent>
    </Card>
  )
}

export function OrganizationCard() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>()
  const categories = useCategories()
  const items = [
    { value: NO_CATEGORY, label: "بدون تصنيف" },
    ...(categories.data ?? []).map((category) => ({ value: category.id, label: category.name })),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>التصنيف والضمان</CardTitle>
        <CardDescription>يساعد التصنيف في البحث والتقارير.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormField id="product-category" label="التصنيف" error={errors.categoryId?.message}>
              <Select items={items} value={field.value} onValueChange={(value) => field.onChange(value ?? NO_CATEGORY)}>
                <SelectTrigger id="product-category" className="w-full" {...fieldA11y("product-category", errors.categoryId)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.value || "none"} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />
        <FormField
          id="product-warranty"
          label="مدة الضمان (بالأشهر)"
          description="اتركه فارغاً إن لم يكن هناك ضمان."
          error={errors.warrantyMonths?.message}
        >
          <Input
            id="product-warranty"
            inputMode="numeric"
            dir="ltr"
            placeholder="12"
            className="text-end"
            {...fieldA11y("product-warranty", errors.warrantyMonths)}
            {...register("warrantyMonths")}
          />
        </FormField>
      </CardContent>
    </Card>
  )
}

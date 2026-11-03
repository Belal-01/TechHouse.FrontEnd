"use client"

import { Plus, X } from "lucide-react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "../../schemas/product.schema"

export function SpecificationsCard() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "specifications" })

  return (
    <Card>
      <CardHeader>
        <CardTitle>المواصفات</CardTitle>
        <CardDescription>مواصفات مشتركة بين كل الأنواع، مثل المعالج أو حجم الشاشة.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {fields.map((field, index) => {
          const error = errors.specifications?.[index]
          return (
            <div key={field.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Input
                  aria-label={`اسم المواصفة ${index + 1}`}
                  placeholder="المعالج"
                  className="flex-1"
                  aria-invalid={error?.key ? true : undefined}
                  {...register(`specifications.${index}.key`)}
                />
                <Input
                  aria-label={`قيمة المواصفة ${index + 1}`}
                  placeholder="A16 Bionic"
                  className="flex-1"
                  aria-invalid={error?.value ? true : undefined}
                  {...register(`specifications.${index}.value`)}
                />
                <Button type="button" variant="ghost" size="icon" aria-label={`حذف المواصفة ${index + 1}`} onClick={() => remove(index)}>
                  <X aria-hidden />
                </Button>
              </div>
              {error?.key?.message || error?.value?.message ? (
                <p className="small text-red">{error?.key?.message ?? error?.value?.message}</p>
              ) : null}
            </div>
          )
        })}
        <Button type="button" variant="outline" className="self-start" onClick={() => append({ key: "", value: "" })}>
          <Plus aria-hidden />
          إضافة مواصفة
        </Button>
      </CardContent>
    </Card>
  )
}

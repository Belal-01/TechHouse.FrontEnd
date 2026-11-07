"use client"

import { Controller, useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { fieldA11y } from "@/lib/field-a11y"
import { PAID_FROM_LABELS } from "../../lib/invoice-form"
import type { InvoiceFormValues } from "../../schemas/invoice.schema"
import { SupplierSelect } from "../supplier-select"

const PAID_FROM_ITEMS = (Object.keys(PAID_FROM_LABELS) as (keyof typeof PAID_FROM_LABELS)[]).map((value) => ({
  value,
  label: PAID_FROM_LABELS[value],
}))

export function DetailsCard() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>()
  const paidFrom = watch("paidFrom")

  return (
    <Card>
      <CardHeader>
        <CardTitle>بيانات الفاتورة</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Controller
          control={control}
          name="supplierId"
          render={({ field }) => (
            <FormField id="invoice-supplier" label="المورد" description="اختياري." error={errors.supplierId?.message}>
              <SupplierSelect
                id="invoice-supplier"
                className="w-full"
                emptyLabel="بدون مورد"
                activeOnly
                value={field.value}
                onValueChange={field.onChange}
                {...fieldA11y("invoice-supplier", errors.supplierId)}
              />
            </FormField>
          )}
        />
        <FormField id="invoice-date" label="تاريخ الفاتورة" error={errors.invoiceDate?.message}>
          <Input id="invoice-date" type="date" dir="ltr" {...fieldA11y("invoice-date", errors.invoiceDate)} {...register("invoiceDate")} />
        </FormField>
        <Controller
          control={control}
          name="paidFrom"
          render={({ field }) => (
            <FormField
              id="invoice-paid-from"
              label="مصدر الدفع"
              description={
                paidFrom === "INCOME"
                  ? "يُخصم المبلغ من محفظة الدولار."
                  : "مال جديد تضعه في المتجر لهذه الفاتورة: يدخل ويخرج، فلا يتغير رصيد المحفظة."
              }
            >
              <Select items={PAID_FROM_ITEMS} value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                <SelectTrigger id="invoice-paid-from" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAID_FROM_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />
        <FormField id="invoice-notes" label="ملاحظات" description="اختياري، مثل رقم فاتورة المورد." error={errors.notes?.message}>
          <Textarea id="invoice-notes" rows={3} maxLength={5000} {...fieldA11y("invoice-notes", errors.notes)} {...register("notes")} />
        </FormField>
      </CardContent>
    </Card>
  )
}

"use client"

import { useFormContext } from "react-hook-form"
import { PriceInput } from "@/components/common/price-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Separator } from "@/components/ui/separator"
import { fieldA11y } from "@/lib/field-a11y"
import { formatMoney } from "@/lib/format"
import type { InvoiceFormValues } from "../../schemas/invoice.schema"

type CostsCardProps = {
  itemsTotal: number
  extraTotal: number
}

export function CostsCard({ itemsTotal, extraTotal }: CostsCardProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>الشحن والإجمالي</CardTitle>
        <CardDescription>تكاليف الفاتورة كلها حتى وصول البضاعة. تُضاف إلى تكلفة القطع ولا تُسجَّل على المورد.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField id="invoice-shipping" label="الشحن" description="اتركه فارغاً إن لم يكن هناك شحن." error={errors.shippingCostUsd?.message}>
          <PriceInput id="invoice-shipping" {...fieldA11y("invoice-shipping", errors.shippingCostUsd)} {...register("shippingCostUsd")} />
        </FormField>
        <FormField id="invoice-customs" label="جمارك وتخليص" description="اختياري." error={errors.customsCostUsd?.message}>
          <PriceInput id="invoice-customs" {...fieldA11y("invoice-customs", errors.customsCostUsd)} {...register("customsCostUsd")} />
        </FormField>

        <Separator />
        <dl className="flex flex-col gap-2 small" aria-live="polite">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">قيمة البضاعة</dt>
            <dd dir="ltr">{formatMoney(itemsTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">الشحن والجمارك</dt>
            <dd dir="ltr">{formatMoney(extraTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-2 font-semibold text-foreground">
            <dt>الإجمالي</dt>
            <dd dir="ltr">{formatMoney(itemsTotal + extraTotal)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

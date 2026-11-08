"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fieldA11y } from "@/lib/field-a11y"
import type { OrderFormValues } from "../../schemas/order.schema"

export function CustomerCard() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrderFormValues>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>الزبون</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <FormField id="order-customer-name" label="الاسم" error={errors.customerName?.message}>
          <Input id="order-customer-name" autoComplete="off" maxLength={255} {...fieldA11y("order-customer-name", errors.customerName)} {...register("customerName")} />
        </FormField>
        <FormField id="order-customer-phone" label="الهاتف" description="اختياري." error={errors.customerPhone?.message}>
          <Input
            id="order-customer-phone"
            type="tel"
            dir="ltr"
            autoComplete="off"
            maxLength={50}
            className="text-end"
            {...fieldA11y("order-customer-phone", errors.customerPhone)}
            {...register("customerPhone")}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField id="order-customer-address" label="العنوان" description="اختياري." error={errors.customerAddress?.message}>
            <Textarea id="order-customer-address" rows={2} maxLength={2000} {...fieldA11y("order-customer-address", errors.customerAddress)} {...register("customerAddress")} />
          </FormField>
        </div>
      </CardContent>
    </Card>
  )
}

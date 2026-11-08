"use client"

import { useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { Plus } from "lucide-react"
import { PriceInput } from "@/components/common/price-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fieldA11y } from "@/lib/field-a11y"
import { CURRENCY_LABELS } from "../../lib/order-form"
import type { OrderFormValues } from "../../schemas/order.schema"
import { DeliveryCompanyFormDialog } from "../delivery-company-form-dialog"
import { DeliveryCompanySelect } from "../delivery-company-select"

export const CURRENCY_ITEMS = (["USD", "SYP"] as const).map((value) => ({ value, label: CURRENCY_LABELS[value] }))

export function DeliveryCard() {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OrderFormValues>()
  const [costCurrency, currency] = watch(["deliveryCostCurrency", "currency"])
  const [newCompany, setNewCompany] = useState({ open: false, session: 0 })

  return (
    <Card>
      <CardHeader>
        <CardTitle>التوصيل</CardTitle>
        <CardDescription>الأجرة التي تدفعها لشركة التوصيل تُسجَّل مصروفاً الآن.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Controller
          control={control}
          name="deliveryCompanyId"
          render={({ field }) => (
            <FormField id="order-company" label="شركة التوصيل" description="اختياري." error={errors.deliveryCompanyId?.message}>
              <div className="flex gap-2">
                <DeliveryCompanySelect
                  id="order-company"
                  className="w-full min-w-0 flex-1"
                  emptyLabel="بدون شركة"
                  value={field.value}
                  onValueChange={field.onChange}
                  {...fieldA11y("order-company", errors.deliveryCompanyId)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="إضافة شركة توصيل"
                  title="إضافة شركة توصيل"
                  onClick={() => setNewCompany((s) => ({ open: true, session: s.session + 1 }))}
                >
                  <Plus aria-hidden />
                </Button>
              </div>
            </FormField>
          )}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2">
          <FormField id="order-delivery-cost" label="أجرة الشركة" error={errors.deliveryCost?.message}>
            <PriceInput id="order-delivery-cost" currency={costCurrency} {...fieldA11y("order-delivery-cost", errors.deliveryCost)} {...register("deliveryCost")} />
          </FormField>
          <Controller
            control={control}
            name="deliveryCostCurrency"
            render={({ field }) => (
              <FormField id="order-delivery-currency" label="العملة">
                <Select items={CURRENCY_ITEMS} value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                  <SelectTrigger id="order-delivery-currency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
        </div>
        <FormField
          id="order-fee-charged"
          label="رسوم توصيل على الزبون"
          description="اختياري: إن كان الزبون يدفع التوصيل فوق سعر المنتجات."
          error={errors.deliveryFeeCharged?.message}
        >
          <PriceInput id="order-fee-charged" currency={currency} {...fieldA11y("order-fee-charged", errors.deliveryFeeCharged)} {...register("deliveryFeeCharged")} />
        </FormField>
      </CardContent>
      <DeliveryCompanyFormDialog
        key={newCompany.session}
        open={newCompany.open}
        onOpenChange={(open) => setNewCompany((s) => ({ ...s, open }))}
        company={null}
        onCreated={(company) => setValue("deliveryCompanyId", company.id, { shouldDirty: true })}
      />
    </Card>
  )
}

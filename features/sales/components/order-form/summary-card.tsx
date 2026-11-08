"use client"

import Link from "next/link"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { MoneyAmount } from "@/components/common/money-amount"
import { SypAmount } from "@/components/common/syp-amount"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { fieldA11y } from "@/lib/field-a11y"
import { formatMoney } from "@/lib/format"
import type { OrderFormValues } from "../../schemas/order.schema"
import { CURRENCY_ITEMS } from "./delivery-card"

type SummaryCardProps = {
  /** Sell rate in use (SYP per USD), or null when there is none yet. */
  sellRate: number | null
  onCurrencyChange: (currency: "USD" | "SYP") => void
}

export function SummaryCard({ sellRate, onCurrencyChange }: SummaryCardProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<OrderFormValues>()
  const [items, currency, feeCharged, deliveryCostCurrency, deliveryCost] = useWatch({
    control,
    name: ["items", "currency", "deliveryFeeCharged", "deliveryCostCurrency", "deliveryCost"],
  })
  const itemsTotal = items.reduce((sum, line) => sum + (Number(line.quantity) * Number(line.unitPrice) || 0), 0)
  const total = itemsTotal + (Number(feeCharged) || 0)
  const needsRate = currency === "SYP" || (deliveryCostCurrency === "SYP" && Number(deliveryCost) > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>الطلب</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <FormField id="order-currency" label="عملة البيع" description="بها يدفع الزبون، وإليها تدخل المحفظة.">
              <Select items={CURRENCY_ITEMS} value={field.value} onValueChange={(value) => value && onCurrencyChange(value)}>
                <SelectTrigger id="order-currency" className="w-full">
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
        <FormField id="order-notes" label="ملاحظات" description="اختياري." error={errors.notes?.message}>
          <Textarea id="order-notes" rows={2} maxLength={5000} {...fieldA11y("order-notes", errors.notes)} {...register("notes")} />
        </FormField>

        <Separator />
        <dl className="flex flex-col gap-2 small" aria-live="polite">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">المنتجات</dt>
            <dd>
              <MoneyAmount value={itemsTotal} currency={currency} />
            </dd>
          </div>
          {Number(feeCharged) > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">رسوم التوصيل</dt>
              <dd>
                <MoneyAmount value={Number(feeCharged)} currency={currency} />
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-t pt-2 font-semibold text-foreground">
            <dt>يدفع الزبون</dt>
            <dd>
              <MoneyAmount value={total} currency={currency} />
            </dd>
          </div>
          {currency === "SYP" && sellRate ? (
            <div className="flex justify-between gap-4 text-muted-foreground">
              <dt>بالدولار</dt>
              <dd dir="ltr">{formatMoney(total / sellRate)}</dd>
            </div>
          ) : null}
        </dl>
        {needsRate ? (
          sellRate ? (
            <p className="small text-muted-foreground">
              يُثبَّت سعر المبيع على الطلب: 1$ = <SypAmount value={sellRate} />
            </p>
          ) : (
            <Alert>
              لا يوجد سعر صرف بعد، وهو مطلوب للبيع أو الدفع بالليرة.{" "}
              <Link href="/finance/exchange-rates" className="underline">
                أدخل سعر اليوم
              </Link>
            </Alert>
          )
        ) : null}
      </CardContent>
    </Card>
  )
}

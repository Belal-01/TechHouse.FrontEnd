"use client"

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { PriceInput } from "@/components/common/price-input"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { fieldA11y } from "@/lib/field-a11y"
import { formatMoney } from "@/lib/format"
import { DEFAULT_PAYER } from "../../lib/invoice-form"
import { MAX_GOODS_PAYMENTS, type InvoiceFormValues } from "../../schemas/invoice.schema"
import { PayerSelect } from "../payer-select"

/** Who paid the supplier for the goods: one payer, or split between boxes, owners and investors. */
export function PaymentsCard({ goodsTotal }: { goodsTotal: number }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "payments" })
  const payments = useWatch({ control, name: "payments" })
  const split = fields.length > 1
  const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const left = Math.round((goodsTotal - paid) * 10_000) / 10_000
  const listError = errors.payments?.root?.message ?? errors.payments?.message

  return (
    <Card>
      <CardHeader>
        <CardTitle>الدفع للمورد</CardTitle>
        <CardDescription>من دفع ثمن البضاعة. يمكن تقسيمه، مثلاً جزء من الصندوق وجزء من مال صاحب شركة أو مستثمر.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {listError ? <Alert>{listError}</Alert> : null}
        <ol className="flex flex-col gap-3" aria-label="الدفعات">
          {fields.map((field, index) => {
            const id = (name: string) => `invoice-payment-${index}-${name}`
            const lineErrors = errors.payments?.[index]
            return (
              <li key={field.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-start">
                <Controller
                  control={control}
                  name={`payments.${index}.payer`}
                  render={({ field: payer }) => (
                    <FormField id={id("payer")} label="الدافع" error={lineErrors?.payer?.message}>
                      <PayerSelect id={id("payer")} value={payer.value} onValueChange={payer.onChange} {...fieldA11y(id("payer"), lineErrors?.payer)} />
                    </FormField>
                  )}
                />
                {split ? (
                  <FormField id={id("amount")} label="المبلغ" error={lineErrors?.amount?.message}>
                    <PriceInput id={id("amount")} {...fieldA11y(id("amount"), lineErrors?.amount)} {...register(`payments.${index}.amount`)} />
                  </FormField>
                ) : (
                  <div className="flex flex-col gap-2 small">
                    <span className="font-semibold">المبلغ</span>
                    <span className="flex h-9 items-center text-muted-foreground">
                      كامل البضاعة <span dir="ltr" className="ms-1 text-foreground">{formatMoney(goodsTotal)}</span>
                    </span>
                  </div>
                )}
                {split ? (
                  <Button type="button" variant="ghost" size="sm" className="self-end sm:mt-7" onClick={() => remove(index)} aria-label={`حذف الدفعة ${index + 1}`}>
                    <Trash2 aria-hidden />
                    حذف
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={fields.length >= MAX_GOODS_PAYMENTS}
            onClick={() => append({ payer: DEFAULT_PAYER, amount: split ? (left > 0 ? String(left) : "") : "" }, { focusName: `payments.${fields.length}.payer` })}
          >
            <Plus aria-hidden />
            {split ? "إضافة دافع" : "تقسيم الدفع"}
          </Button>
          {split ? (
            <p className="small" aria-live="polite">
              <span className="text-muted-foreground">{left >= 0 ? "المتبقي: " : "زيادة: "}</span>
              <span dir="ltr" className={left === 0 ? "font-semibold" : "font-semibold text-red"}>
                {formatMoney(Math.abs(left))}
              </span>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

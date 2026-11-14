"use client"

import { useId, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { FormDialog } from "@/components/common/form-dialog"
import { MoneyAmount } from "@/components/common/money-amount"
import { PriceInput } from "@/components/common/price-input"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { fieldA11y } from "@/lib/field-a11y"
import { useAssignFunding } from "../api/invoices"
import { parsePayer } from "../lib/invoice-form"
import { assignFormSchema, type AssignFormValues } from "../schemas/invoice.schema"
import type { InvoicePayment } from "../types"
import { PayerSelect } from "./payer-select"

export function AssignFundingDialog({ invoiceId, payment, onClose }: {
  invoiceId: string
  payment: InvoicePayment
  onClose: () => void
}) {
  const prefix = useId()
  const assign = useAssignFunding(invoiceId)
  const [error, setError] = useState<string | null>(null)
  const { control, register, handleSubmit, setError: setFieldError, formState: { errors } } = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema(payment.amount)),
    defaultValues: { parts: [{ partner: "", amount: String(payment.amount) }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: "parts" })

  const submit = handleSubmit(async ({ parts }) => {
    setError(null)
    try {
      await assign.mutateAsync({
        paymentId: payment.id,
        parts: parts.map(({ partner, amount }) => {
          const payer = parsePayer(partner)
          return { source: payer.source === "INVESTOR" ? "INVESTOR" : "OWNER", partnerId: payer.partnerId ?? "", amount: Number(amount) }
        }),
      })
      onClose()
    } catch (error) {
      const handled = applyApiError(error, setFieldError, {
        mapField: (field) => /^parts\.\d+\.partnerId$/.test(field) ? field.replace(/partnerId$/, "partner") : null,
      })
      if (!handled) setError(toUserMessage(error))
    }
  })

  return (
    <FormDialog
      open
      onOpenChange={(open) => { if (!open) onClose() }}
      title="تحديد أصحاب الدفعة"
      description={<>وزّع <MoneyAmount value={payment.amount} currency={payment.currency} /> على أصحاب الشركة أو المستثمرين.</>}
      submitLabel="حفظ التوزيع"
      cancelLabel="رجوع"
      onSubmit={submit}
      isPending={assign.isPending}
      error={error ?? errors.parts?.root?.message ?? errors.parts?.message}
    >
      {fields.map((field, index) => {
        const personId = `${prefix}-person-${index}`
        const amountId = `${prefix}-amount-${index}`
        const rowError = errors.parts?.[index]
        return (
          <div key={field.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
            <Controller
              control={control}
              name={`parts.${index}.partner`}
              render={({ field }) => (
                <FormField id={personId} label="الشخص" error={rowError?.partner?.message}>
                  <PayerSelect id={personId} peopleOnly value={field.value} onValueChange={field.onChange} {...fieldA11y(personId, rowError?.partner)} />
                </FormField>
              )}
            />
            <FormField id={amountId} label="المبلغ" error={rowError?.amount?.message}>
              <PriceInput id={amountId} currency={payment.currency} {...fieldA11y(amountId, rowError?.amount)} {...register(`parts.${index}.amount`)} />
            </FormField>
            {fields.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>حذف الجزء</Button> : null}
          </div>
        )
      })}
      <Button type="button" variant="outline" disabled={fields.length >= 10} onClick={() => append({ partner: "", amount: "" })}>
        إضافة شخص
      </Button>
    </FormDialog>
  )
}

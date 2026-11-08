"use client"

import { format } from "date-fns"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { MoneyAmount } from "@/components/common/money-amount"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fieldA11y } from "@/lib/field-a11y"
import { useAdvanceAction } from "../../api/people"
import { spendSchema, type SpendFormValues } from "../../schemas/advance.schema"
import type { Person } from "../../types"
import { useMoneyDialogSubmit } from "../cash/use-money-dialog"
import { ExpenseCategorySelect } from "../expense-category-select"
import { AmountField, CurrencyField } from "../form-fields"

type SpendDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; person: Person }

/** Part of an advance was spent on the shop: it becomes an expense and the person owes that much less. */
export function SpendDialog({ open, onOpenChange, person }: SpendDialogProps) {
  const action = useAdvanceAction(person.id)
  const form = useForm<SpendFormValues>({
    resolver: zodResolver(spendSchema),
    defaultValues: {
      currency: person.owedUsd > 0 && person.owedSyp <= 0 ? "USD" : "SYP",
      amount: "",
      categoryId: "",
      expenseDate: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
  })
  const { register, control, formState: { errors } } = form
  const currency = useWatch({ control, name: "currency" })
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false))
  const onSubmit = form.handleSubmit((v) =>
    run(
      () =>
        action.mutateAsync({
          action: "spend",
          currency: v.currency,
          amount: Number(v.amount),
          categoryId: v.categoryId,
          expenseDate: v.expenseDate,
          description: v.description.trim() || null,
        }),
      "سُجّل المصروف من السلفة",
    ),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`صرف من سلفة ${person.name}`}
      description="صرف الشخص جزءاً من السلفة على المتجر (مثلاً اشترى تغليفاً). يُسجَّل مصروفاً ويقل ما عليه."
      submitLabel="تسجيل المصروف"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={action.isPending}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyField control={control} name="currency" id="spend-currency" label="العملة" />
        <AmountField register={register} name="amount" id="spend-amount" label="المبلغ" currency={currency} error={errors.amount} />
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormField id="spend-category" label="الفئة" error={errors.categoryId?.message}>
              <ExpenseCategorySelect id="spend-category" value={field.value} onValueChange={field.onChange} {...fieldA11y("spend-category", errors.categoryId)} />
            </FormField>
          )}
        />
        <FormField id="spend-date" label="التاريخ" error={errors.expenseDate?.message}>
          <Input id="spend-date" type="date" dir="ltr" {...fieldA11y("spend-date", errors.expenseDate)} {...register("expenseDate")} />
        </FormField>
      </div>
      <p className="small text-muted-foreground">
        عليه الآن: <MoneyAmount value={currency === "USD" ? person.owedUsd : person.owedSyp} currency={currency} className="text-foreground" />
      </p>
      <FormField id="spend-description" label="الوصف" description="اختياري." error={errors.description?.message}>
        <Textarea id="spend-description" rows={2} maxLength={2000} {...register("description")} />
      </FormField>
    </FormDialog>
  )
}

"use client"

import { format } from "date-fns"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fieldA11y } from "@/lib/field-a11y"
import { useCreateExpense } from "../../api/expenses"
import { expenseSchema, type ExpenseFormValues } from "../../schemas/expense.schema"
import { BalanceHint } from "../balance-hint"
import { useMoneyDialogSubmit } from "../cash/use-money-dialog"
import { ExpenseCategorySelect } from "../expense-category-select"
import { AccountField, AmountField, CurrencyField } from "../form-fields"

type ExpenseDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; defaultAccountId: string }

export function ExpenseDialog({ open, onOpenChange, defaultAccountId }: ExpenseDialogProps) {
  const create = useCreateExpense()
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      categoryId: "",
      amount: "",
      currency: "SYP",
      accountId: defaultAccountId,
      // Local date: late in the evening the UTC date is already tomorrow.
      expenseDate: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
  })
  const { register, control, formState: { errors } } = form
  const [account, currency, amount] = useWatch({ control, name: ["accountId", "currency", "amount"] })
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false))
  const onSubmit = form.handleSubmit((v) =>
    run(
      () =>
        create.mutateAsync({
          categoryId: v.categoryId,
          amount: Number(v.amount),
          currency: v.currency,
          accountId: v.accountId,
          expenseDate: v.expenseDate,
          description: v.description.trim() || null,
        }),
      "تمت إضافة المصروف",
    ),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إضافة مصروف"
      description="يُخصم من الصندوق، ويُحوَّل إلى الدولار بسعر المبيع إن كان بالليرة."
      submitLabel="إضافة"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={create.isPending}
      error={formError}
    >
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <FormField id="expense-category" label="الفئة" error={errors.categoryId?.message}>
            <ExpenseCategorySelect id="expense-category" value={field.value} onValueChange={field.onChange} {...fieldA11y("expense-category", errors.categoryId)} />
          </FormField>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AmountField register={register} name="amount" id="expense-amount" label="المبلغ" currency={currency} error={errors.amount} />
        <CurrencyField control={control} name="currency" id="expense-currency" label="العملة" />
        <AccountField control={control} name="accountId" id="expense-account" label="يُدفع من" error={errors.accountId} />
        <FormField id="expense-date" label="التاريخ" error={errors.expenseDate?.message}>
          <Input id="expense-date" type="date" dir="ltr" {...fieldA11y("expense-date", errors.expenseDate)} {...register("expenseDate")} />
        </FormField>
      </div>
      <BalanceHint accountId={account} currency={currency} outgoing={Number(amount)} />
      <FormField id="expense-description" label="الوصف" description="اختياري، مثل: إعلان فيسبوك أسبوع 2." error={errors.description?.message}>
        <Textarea id="expense-description" rows={2} maxLength={2000} {...fieldA11y("expense-description", errors.description)} {...register("description")} />
      </FormField>
    </FormDialog>
  )
}

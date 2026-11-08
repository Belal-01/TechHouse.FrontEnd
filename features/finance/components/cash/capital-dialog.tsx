"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { useCapital } from "../../api/cash"
import { boxAmountSchema, type BoxAmountValues } from "../../schemas/cash.schema"
import { AccountField, AmountField, CurrencyField, NoteField } from "../form-fields"
import { useMoneyDialogSubmit } from "./use-money-dialog"

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void; defaultAccountId: string }

/** Money put into the shop: the opening balance, or new capital later. */
export function CapitalDialog({ open, onOpenChange, defaultAccountId }: DialogProps) {
  const capital = useCapital()
  const form = useForm<BoxAmountValues>({
    resolver: zodResolver(boxAmountSchema),
    defaultValues: { accountId: defaultAccountId, currency: "USD", amount: "", note: "" },
  })
  const { register, control, formState: { errors } } = form
  const currency = useWatch({ control, name: "currency" })
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false))
  const onSubmit = form.handleSubmit((v) =>
    run(() => capital.mutateAsync({ accountId: v.accountId, currency: v.currency, amount: Number(v.amount), note: v.note.trim() || null }), "تم الإيداع"),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إيداع رأس مال"
      description="مال تضعه في المتجر، مثل الرصيد الافتتاحي لكل صندوق. لا يُحتسب ربحاً."
      submitLabel="إيداع"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={capital.isPending}
      error={formError}
    >
      <AccountField control={control} name="accountId" id="capital-account" label="الصندوق" error={errors.accountId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyField control={control} name="currency" id="capital-currency" label="العملة" />
        <AmountField register={register} name="amount" id="capital-amount" label="المبلغ" currency={currency} error={errors.amount} />
      </div>
      <NoteField register={register} name="note" id="capital-note" label="ملاحظة" description="اختياري، مثل: رصيد افتتاحي." error={errors.note} />
    </FormDialog>
  )
}

"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { useTransfer } from "../../api/cash"
import { transferSchema, type TransferValues } from "../../schemas/cash.schema"
import { BalanceHint } from "../balance-hint"
import { AccountField, AmountField, CurrencyField, NoteField } from "../form-fields"
import { useMoneyDialogSubmit } from "./use-money-dialog"

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void; defaultAccountId: string }

/** Same currency from one box to another, e.g. depositing cash into Sham Cash. */
export function TransferDialog({ open, onOpenChange, defaultAccountId }: DialogProps) {
  const transfer = useTransfer()
  const form = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fromAccountId: defaultAccountId, toAccountId: "", currency: "SYP", amount: "", note: "" },
  })
  const { register, control, formState: { errors } } = form
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false), { SAME_ACCOUNT: "toAccountId" })
  const [from, currency, amount] = useWatch({ control, name: ["fromAccountId", "currency", "amount"] })
  const onSubmit = form.handleSubmit((v) =>
    run(
      () => transfer.mutateAsync({ fromAccountId: v.fromAccountId, toAccountId: v.toAccountId, currency: v.currency, amount: Number(v.amount), note: v.note.trim() || null }),
      "تم التحويل",
    ),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="تحويل بين الصناديق"
      description="نقل مبلغ بنفس العملة من صندوق إلى آخر. لا يغيّر الربح."
      submitLabel="تحويل"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={transfer.isPending}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AccountField control={control} name="fromAccountId" id="transfer-from" label="من" error={errors.fromAccountId} />
        <AccountField control={control} name="toAccountId" id="transfer-to" label="إلى" error={errors.toAccountId} />
        <CurrencyField control={control} name="currency" id="transfer-currency" label="العملة" />
        <AmountField register={register} name="amount" id="transfer-amount" label="المبلغ" currency={currency} error={errors.amount} />
      </div>
      <BalanceHint accountId={from} currency={currency} outgoing={Number(amount)} />
      <NoteField register={register} name="note" id="transfer-note" label="ملاحظة" description="اختياري." error={errors.note} />
    </FormDialog>
  )
}

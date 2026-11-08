"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { MoneyAmount } from "@/components/common/money-amount"
import { useAdvanceAction } from "../../api/people"
import { boxAmountSchema, type BoxAmountValues } from "../../schemas/cash.schema"
import type { Person } from "../../types"
import { BalanceHint } from "../balance-hint"
import { useMoneyDialogSubmit } from "../cash/use-money-dialog"
import { AccountField, AmountField, CurrencyField, NoteField } from "../form-fields"

type AdvanceCashDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: Person
  /** withdraw: the person takes money from a box; return: gives it back to one. */
  mode: "withdraw" | "return"
  defaultAccountId: string
}

const COPY = {
  withdraw: {
    title: "سحب سلفة",
    description: "مبلغ يأخذه الشخص من الصندوق. يبقى مالاً للمتجر عليه، ولا يُحتسب مصروفاً.",
    submit: "تسجيل السحب",
    success: "سُجّلت السلفة",
    account: "من صندوق",
  },
  return: {
    title: "إعادة سلفة",
    description: "يعيد الشخص كل المبلغ أو جزءاً منه إلى صندوق.",
    submit: "تسجيل الإعادة",
    success: "سُجّلت الإعادة",
    account: "إلى صندوق",
  },
} as const

export function AdvanceCashDialog({ open, onOpenChange, person, mode, defaultAccountId }: AdvanceCashDialogProps) {
  const action = useAdvanceAction(person.id)
  const copy = COPY[mode]
  const startCurrency = mode === "return" && person.owedUsd > 0 && person.owedSyp <= 0 ? "USD" : "SYP"
  const form = useForm<BoxAmountValues>({
    resolver: zodResolver(boxAmountSchema),
    defaultValues: { accountId: defaultAccountId, currency: startCurrency, amount: "", note: "" },
  })
  const { register, control, formState: { errors } } = form
  const [account, currency, amount] = useWatch({ control, name: ["accountId", "currency", "amount"] })
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false))
  const owed = currency === "USD" ? person.owedUsd : person.owedSyp
  const onSubmit = form.handleSubmit((v) =>
    run(
      () => action.mutateAsync({ action: mode, accountId: v.accountId, currency: v.currency, amount: Number(v.amount), note: v.note.trim() || null }),
      copy.success,
    ),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${copy.title}: ${person.name}`}
      description={copy.description}
      submitLabel={copy.submit}
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={action.isPending}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyField control={control} name="currency" id="advance-currency" label="العملة" />
        <AmountField register={register} name="amount" id="advance-amount" label="المبلغ" currency={currency} error={errors.amount} />
      </div>
      <AccountField control={control} name="accountId" id="advance-account" label={copy.account} error={errors.accountId} />
      {mode === "withdraw" ? (
        <BalanceHint accountId={account} currency={currency} outgoing={Number(amount)} />
      ) : (
        <p className="small text-muted-foreground">
          عليه الآن: <MoneyAmount value={owed} currency={currency} className="text-foreground" />
        </p>
      )}
      <NoteField register={register} name="note" id="advance-note" label="ملاحظة" description="اختياري." error={errors.note} />
    </FormDialog>
  )
}

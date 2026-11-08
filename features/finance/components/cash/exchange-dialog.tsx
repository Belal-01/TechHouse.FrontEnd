"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { SypAmount } from "@/components/common/syp-amount"
import { useExchange } from "../../api/cash"
import { exchangeSchema, type ExchangeValues } from "../../schemas/cash.schema"
import { BalanceHint } from "../balance-hint"
import { AccountField, AmountField, CurrencyField, NoteField } from "../form-fields"
import { useMoneyDialogSubmit } from "./use-money-dialog"

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void; defaultAccountId: string }

/** Dollars to pounds or back, with the real amounts given and received; the rate obtained is shown. */
export function ExchangeDialog({ open, onOpenChange, defaultAccountId }: DialogProps) {
  const exchange = useExchange()
  const form = useForm<ExchangeValues>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: { fromAccountId: defaultAccountId, fromCurrency: "USD", fromAmount: "", toAccountId: defaultAccountId, toAmount: "", note: "" },
  })
  const { register, control, formState: { errors } } = form
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false))
  const [from, fromCurrency, fromAmount, toAmount] = useWatch({ control, name: ["fromAccountId", "fromCurrency", "fromAmount", "toAmount"] })
  const toCurrency = fromCurrency === "USD" ? "SYP" : "USD"
  const usd = Number(fromCurrency === "USD" ? fromAmount : toAmount)
  const syp = Number(fromCurrency === "SYP" ? fromAmount : toAmount)
  const rate = usd > 0 && syp > 0 ? syp / usd : null

  const onSubmit = form.handleSubmit((v) =>
    run(
      () =>
        exchange.mutateAsync({
          fromAccountId: v.fromAccountId,
          fromCurrency: v.fromCurrency,
          fromAmount: Number(v.fromAmount),
          toAccountId: v.toAccountId,
          toAmount: Number(v.toAmount),
          note: v.note.trim() || null,
        }),
      "تم التصريف",
    ),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="تصريف عملة"
      description="أدخل ما دفعته وما استلمته فعلاً، ويُحسب سعر التصريف منهما."
      submitLabel="تصريف"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={exchange.isPending}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyField control={control} name="fromCurrency" id="exchange-from-currency" label="أدفع بـ" />
        <AmountField register={register} name="fromAmount" id="exchange-from-amount" label="المبلغ المدفوع" currency={fromCurrency} error={errors.fromAmount} />
        <AccountField control={control} name="fromAccountId" id="exchange-from-account" label="من صندوق" error={errors.fromAccountId} />
        <AmountField register={register} name="toAmount" id="exchange-to-amount" label="المبلغ المستلم" currency={toCurrency} error={errors.toAmount} />
        <AccountField control={control} name="toAccountId" id="exchange-to-account" label="إلى صندوق" error={errors.toAccountId} />
      </div>
      <BalanceHint accountId={from} currency={fromCurrency} outgoing={Number(fromAmount)} />
      {rate ? (
        <p className="small text-muted-foreground">
          سعر التصريف: 1$ = <SypAmount value={Math.round(rate * 100) / 100} className="text-foreground" />
        </p>
      ) : null}
      <NoteField register={register} name="note" id="exchange-note" label="ملاحظة" description="اختياري، مثل اسم الصرّاف." error={errors.note} />
    </FormDialog>
  )
}

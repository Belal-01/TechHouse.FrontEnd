"use client"

import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/ui/form-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdjustment } from "../../api/cash"
import { adjustmentSchema, type AdjustmentValues } from "../../schemas/cash.schema"
import { BalanceHint } from "../balance-hint"
import { AccountField, AmountField, CurrencyField, NoteField } from "../form-fields"
import { useMoneyDialogSubmit } from "./use-money-dialog"

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void; defaultAccountId: string }

const DIRECTIONS = [
  { value: "in", label: "زيادة (في الصندوق أكثر من المسجّل)" },
  { value: "out", label: "نقص (في الصندوق أقل من المسجّل)" },
]

/** Brings the books in line with what is really in a box. A reason is required. */
export function AdjustmentDialog({ open, onOpenChange, defaultAccountId }: DialogProps) {
  const adjustment = useAdjustment()
  const form = useForm<AdjustmentValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { accountId: defaultAccountId, currency: "SYP", direction: "out", amount: "", note: "" },
  })
  const { register, control, formState: { errors } } = form
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false))
  const [account, currency, direction, amount] = useWatch({ control, name: ["accountId", "currency", "direction", "amount"] })
  const onSubmit = form.handleSubmit((v) =>
    run(
      () => adjustment.mutateAsync({ accountId: v.accountId, currency: v.currency, amount: (v.direction === "out" ? -1 : 1) * Number(v.amount), note: v.note.trim() }),
      "تم تسجيل التسوية",
    ),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="تسوية رصيد"
      description="لتصحيح فرق بين الرصيد في النظام وما في الصندوق فعلاً. تُسجَّل كحركة جديدة ولا تعدّل حركة قديمة."
      submitLabel="تسجيل التسوية"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={adjustment.isPending}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AccountField control={control} name="accountId" id="adjust-account" label="الصندوق" error={errors.accountId} />
        <CurrencyField control={control} name="currency" id="adjust-currency" label="العملة" />
      </div>
      <Controller
        control={control}
        name="direction"
        render={({ field }) => (
          <FormField id="adjust-direction" label="نوع الفرق">
            <Select items={DIRECTIONS} value={field.value} onValueChange={(v) => v && field.onChange(v)}>
              <SelectTrigger id="adjust-direction" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <AmountField register={register} name="amount" id="adjust-amount" label="قيمة الفرق" currency={currency} error={errors.amount} />
      <BalanceHint accountId={account} currency={currency} outgoing={direction === "out" ? Number(amount) : 0} />
      <NoteField register={register} name="note" id="adjust-note" label="السبب" error={errors.note} />
    </FormDialog>
  )
}

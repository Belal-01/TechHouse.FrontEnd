"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { fieldA11y } from "@/lib/field-a11y"
import { useSetManualRate } from "../api/exchange-rates"
import { manualRateSchema, type ManualRateFormValues } from "../schemas/manual-rate.schema"
import type { ExchangeRate } from "../types"

type ManualRateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Prefills the form; remount (key) per opening. */
  initial?: ExchangeRate | null
}

export function ManualRateDialog({ open, onOpenChange, initial }: ManualRateDialogProps) {
  const setManual = useSetManualRate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ManualRateFormValues>({
    resolver: zodResolver(manualRateSchema),
    defaultValues: {
      buyRate: initial ? String(initial.buyRate) : "",
      sellRate: initial ? String(initial.sellRate) : "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await setManual.mutateAsync({ buyRate: Number(values.buyRate), sellRate: Number(values.sellRate) })
      toast.success("تم حفظ سعر اليوم")
      onOpenChange(false)
    } catch (error) {
      if (!applyApiError(error, setError, { codeToField: { RATE_SELL_BELOW_BUY: "sellRate" } })) {
        setFormError(toUserMessage(error))
      }
    }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إدخال سعر اليوم يدوياً"
      description="بالليرة السورية الجديدة لكل دولار واحد (مثلاً 145، لا 14,500). يُستخدم سعر المبيع في البيع، ولا يستبدل التحديث التلقائي هذا السعر اليوم."
      submitLabel="حفظ السعر"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={setManual.isPending}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="rate-buy" label="سعر الشراء" error={errors.buyRate?.message}>
          <Input id="rate-buy" inputMode="decimal" dir="ltr" placeholder="144.5" {...fieldA11y("rate-buy", errors.buyRate)} {...register("buyRate")} />
        </FormField>
        <FormField id="rate-sell" label="سعر المبيع" error={errors.sellRate?.message}>
          <Input id="rate-sell" inputMode="decimal" dir="ltr" placeholder="145.25" {...fieldA11y("rate-sell", errors.sellRate)} {...register("sellRate")} />
        </FormField>
      </div>
    </FormDialog>
  )
}

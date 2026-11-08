"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { FormDialog } from "@/components/common/form-dialog"
import { StatTile } from "@/components/common/stat-tile"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { fieldA11y } from "@/lib/field-a11y"
import { formatMoney } from "@/lib/format"
import { useUpdateProfitShare } from "../api/dashboard"
import type { Dashboard } from "../types"

const schema = z.object({
  label: z.string().trim().min(1, { error: "أدخل اسماً." }).max(60, { error: "60 حرفاً كحد أقصى." }),
  percent: z
    .string()
    .trim()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, { error: "أدخل نسبة مثل 25 أو 12.5." })
    .refine((v) => Number(v) <= 100, { error: "النسبة بين 0 و100." }),
})
type Values = z.infer<typeof schema>

type ProfitShareTileProps = { share: Dashboard["profitShare"]; netProfitUsd: number; className?: string }

/** A share of the period's net profit (25% by default); its name and percentage are editable. */
export function ProfitShareTile({ share, netProfitUsd, className }: ProfitShareTileProps) {
  const [dialog, setDialog] = useState({ open: false, session: 0 })
  return (
    <>
      <StatTile
        className={className}
        label={`${share.label} (${share.percent}%)`}
        value={<span dir="ltr">{formatMoney(share.amountUsd)}</span>}
        hint={netProfitUsd > 0 ? <>من صافي ربح <span dir="ltr">{formatMoney(netProfitUsd)}</span></> : "لا ربح صافٍ في هذه الفترة"}
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="تعديل النسبة"
            title="تعديل النسبة"
            onClick={() => setDialog((s) => ({ open: true, session: s.session + 1 }))}
          >
            <Pencil aria-hidden />
          </Button>
        }
      />
      <ProfitShareDialog key={dialog.session} open={dialog.open} onOpenChange={(open) => setDialog((s) => ({ ...s, open }))} share={share} />
    </>
  )
}

function ProfitShareDialog({ open, onOpenChange, share }: { open: boolean; onOpenChange: (open: boolean) => void; share: Dashboard["profitShare"] }) {
  const update = useUpdateProfitShare()
  const [formError, setFormError] = useState<string | null>(null)
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: share.label, percent: String(share.percent) },
  })
  const onSubmit = handleSubmit(async (v) => {
    setFormError(null)
    try {
      await update.mutateAsync({ label: v.label.trim(), percent: Number(v.percent) })
      toast.success("تم الحفظ")
      onOpenChange(false)
    } catch (error) {
      if (!applyApiError(error, setError)) setFormError(toUserMessage(error))
    }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="نسبة من صافي الربح"
      description="تُحسب من صافي ربح الفترة المعروضة في اللوحة، وتُحفظ للمتجر كله."
      submitLabel="حفظ"
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={update.isPending}
      error={formError}
    >
      <FormField id="share-label" label="الاسم" description="مثل: حصة الشريك، احتياطي، زكاة." error={errors.label?.message}>
        <Input id="share-label" maxLength={60} {...fieldA11y("share-label", errors.label)} {...register("label")} />
      </FormField>
      <FormField id="share-percent" label="النسبة %" error={errors.percent?.message}>
        <Input id="share-percent" inputMode="decimal" dir="ltr" className="text-end" {...fieldA11y("share-percent", errors.percent)} {...register("percent")} />
      </FormField>
    </FormDialog>
  )
}

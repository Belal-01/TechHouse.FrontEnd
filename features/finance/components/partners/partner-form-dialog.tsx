"use client"

import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { fieldA11y } from "@/lib/field-a11y"
import { useCreatePartner, useUpdatePartner } from "../../api/partners"
import { PARTNER_KIND_LABELS } from "../../lib/partner-labels"
import { partnerSchema, type PartnerFormValues } from "../../schemas/partner.schema"
import type { Partner, PartnerKind } from "../../types"
import { useMoneyDialogSubmit } from "../cash/use-money-dialog"

type PartnerFormDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; partner: Partner | null }

const KIND_ITEMS = (Object.keys(PARTNER_KIND_LABELS) as PartnerKind[]).map((value) => ({ value, label: PARTNER_KIND_LABELS[value] }))

export function PartnerFormDialog({ open, onOpenChange, partner }: PartnerFormDialogProps) {
  const create = useCreatePartner()
  const update = useUpdatePartner()
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: partner?.name ?? "",
      kind: partner?.kind ?? "OWNER",
      profitPercent: String(partner?.profitPercent ?? 50),
      phone: partner?.phone ?? "",
      notes: partner?.notes ?? "",
      active: partner?.active ?? true,
    },
  })
  const { register, control, formState: { errors } } = form
  const kind = useWatch({ control, name: "kind" })
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false), { PARTNER_NAME_EXISTS: "name" })
  const onSubmit = form.handleSubmit((v) => {
    const input = {
      name: v.name.trim(),
      kind: v.kind,
      profitPercent: Number(v.profitPercent),
      phone: v.phone.trim() || null,
      notes: v.notes.trim() || null,
      active: v.active,
    }
    return partner
      ? run(() => update.mutateAsync({ id: partner.id, ...input, version: partner.version }), "تم الحفظ")
      : run(() => create.mutateAsync(input), "تمت الإضافة")
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={partner ? `تعديل ${partner.name}` : "إضافة شريك أو مستثمر"}
      description="من يضع ماله الخاص في فواتير الشراء."
      submitLabel={partner ? "حفظ" : "إضافة"}
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={create.isPending || update.isPending}
      error={formError}
    >
      <FormField id="partner-name" label="الاسم" error={errors.name?.message}>
        <Input id="partner-name" autoComplete="off" maxLength={255} {...fieldA11y("partner-name", errors.name)} {...register("name")} />
      </FormField>
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <FormField
            id="partner-kind"
            label="النوع"
            description={partner ? "لا يمكن تغيير النوع بعد الإضافة." : "صاحب الشركة شريك في كل المتجر، والمستثمر شريك في فواتير يموّلها فقط."}
          >
            <Select items={KIND_ITEMS} value={field.value} onValueChange={(value) => value && field.onChange(value)} disabled={partner !== null}>
              <SelectTrigger id="partner-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <FormField
        id="partner-percent"
        label={kind === "OWNER" ? "حصته من الشركة (%)" : "نسبته من ربح ما يموّله (%)"}
        description={kind === "OWNER" ? "مثلاً 50 لكل واحد من صاحبَي الشركة." : "النسبة المتفق عليها عادةً، مثلاً 50."}
        error={errors.profitPercent?.message}
      >
        <Input id="partner-percent" inputMode="decimal" dir="ltr" className="text-end" {...fieldA11y("partner-percent", errors.profitPercent)} {...register("profitPercent")} />
      </FormField>
      <FormField id="partner-phone" label="الهاتف" description="اختياري." error={errors.phone?.message}>
        <Input id="partner-phone" type="tel" dir="ltr" className="text-end" maxLength={50} {...fieldA11y("partner-phone", errors.phone)} {...register("phone")} />
      </FormField>
      <FormField id="partner-notes" label="ملاحظات" description="اختياري، مثل تفاصيل الاتفاق." error={errors.notes?.message}>
        <Textarea id="partner-notes" rows={2} maxLength={2000} {...fieldA11y("partner-notes", errors.notes)} {...register("notes")} />
      </FormField>
      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="partner-active">فعّال</Label>
            <Switch id="partner-active" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </FormDialog>
  )
}

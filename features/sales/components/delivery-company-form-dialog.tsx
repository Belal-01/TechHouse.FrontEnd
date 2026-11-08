"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { fieldA11y } from "@/lib/field-a11y"
import { useCreateDeliveryCompany, useUpdateDeliveryCompany } from "../api/delivery-companies"
import { deliveryCompanySchema, type DeliveryCompanyFormValues } from "../schemas/delivery-company.schema"
import type { DeliveryCompany } from "../types"

type DeliveryCompanyFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = create. Remount (key) per opening. */
  company: DeliveryCompany | null
  /** Called with the new company after a create, e.g. to select it in an order. */
  onCreated?: (company: DeliveryCompany) => void
}

export function DeliveryCompanyFormDialog({ open, onOpenChange, company, onCreated }: DeliveryCompanyFormDialogProps) {
  const isEdit = company !== null
  const create = useCreateDeliveryCompany()
  const update = useUpdateDeliveryCompany()
  const isPending = create.isPending || update.isPending
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DeliveryCompanyFormValues>({
    resolver: zodResolver(deliveryCompanySchema),
    defaultValues: { name: company?.name ?? "", contactInfo: company?.contactInfo ?? "", active: company?.active ?? true },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input = { name: values.name.trim(), contactInfo: values.contactInfo.trim() || null, active: values.active }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: company.id, ...input, version: company.version })
        toast.success("تم حفظ التعديلات")
      } else {
        const created = await create.mutateAsync(input)
        toast.success("تمت إضافة شركة التوصيل")
        onCreated?.(created)
      }
      onOpenChange(false)
    } catch (error) {
      if (!applyApiError(error, setError, { codeToField: { DELIVERY_COMPANY_NAME_EXISTS: "name" } })) {
        setFormError(toUserMessage(error))
      }
    }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "تعديل شركة التوصيل" : "إضافة شركة توصيل"}
      submitLabel={isEdit ? "حفظ التعديلات" : "إضافة"}
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={isPending}
      error={formError}
    >
      <FormField id="company-name" label="اسم الشركة" error={errors.name?.message}>
        <Input id="company-name" autoComplete="off" maxLength={255} readOnly={isPending} {...fieldA11y("company-name", errors.name)} {...register("name")} />
      </FormField>
      <FormField id="company-contact" label="معلومات التواصل" description="اختياري." error={errors.contactInfo?.message}>
        <Textarea id="company-contact" rows={2} maxLength={2000} readOnly={isPending} {...fieldA11y("company-contact", errors.contactInfo)} {...register("contactInfo")} />
      </FormField>
      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="company-active">فعّالة</Label>
              <p className="small text-muted-foreground">الشركة غير الفعّالة لا تظهر عند إدخال طلب جديد.</p>
            </div>
            <Switch id="company-active" checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
          </div>
        )}
      />
    </FormDialog>
  )
}

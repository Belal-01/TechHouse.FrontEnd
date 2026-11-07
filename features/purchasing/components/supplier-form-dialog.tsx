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
import { useCreateSupplier, useUpdateSupplier } from "../api/suppliers"
import { supplierSchema, type SupplierFormValues } from "../schemas/supplier.schema"
import type { Supplier } from "../types"

type SupplierFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = create; a supplier = edit it. Remount (via `key`) when this changes so the form resets. */
  supplier: Supplier | null
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: SupplierFormDialogProps) {
  const isEdit = supplier !== null
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const isPending = createSupplier.isPending || updateSupplier.isPending
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      contactInfo: supplier?.contactInfo ?? "",
      notes: supplier?.notes ?? "",
      active: supplier?.active ?? true,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input = {
      name: values.name.trim(),
      contactInfo: values.contactInfo.trim() || null,
      notes: values.notes.trim() || null,
      active: values.active,
    }
    try {
      if (isEdit) {
        await updateSupplier.mutateAsync({ id: supplier.id, ...input, version: supplier.version })
        toast.success("تم حفظ التعديلات")
      } else {
        await createSupplier.mutateAsync(input)
        toast.success("تمت إضافة المورد")
      }
      onOpenChange(false)
    } catch (error) {
      if (!applyApiError(error, setError, { codeToField: { SUPPLIER_NAME_EXISTS: "name" } })) {
        setFormError(toUserMessage(error))
      }
    }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "تعديل المورد" : "إضافة مورد"}
      description="الجهة التي تشتري منها البضاعة."
      submitLabel={isEdit ? "حفظ التعديلات" : "إضافة"}
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={isPending}
      error={formError}
    >
      <FormField id="supplier-name" label="اسم المورد" error={errors.name?.message}>
        <Input
          id="supplier-name"
          autoComplete="off"
          maxLength={255}
          readOnly={isPending}
          {...fieldA11y("supplier-name", errors.name)}
          {...register("name")}
        />
      </FormField>
      <FormField
        id="supplier-contact"
        label="معلومات التواصل"
        description="اختياري: الهاتف أو واتساب أو العنوان."
        error={errors.contactInfo?.message}
      >
        <Textarea
          id="supplier-contact"
          rows={2}
          maxLength={2000}
          readOnly={isPending}
          {...fieldA11y("supplier-contact", errors.contactInfo)}
          {...register("contactInfo")}
        />
      </FormField>
      <FormField id="supplier-notes" label="ملاحظات" description="اختياري." error={errors.notes?.message}>
        <Textarea
          id="supplier-notes"
          rows={3}
          maxLength={5000}
          readOnly={isPending}
          {...fieldA11y("supplier-notes", errors.notes)}
          {...register("notes")}
        />
      </FormField>
      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="supplier-active">فعّال</Label>
              <p className="small text-muted-foreground">المورد غير الفعّال لا يظهر عند إدخال فاتورة جديدة.</p>
            </div>
            <Switch id="supplier-active" checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
          </div>
        )}
      />
    </FormDialog>
  )
}

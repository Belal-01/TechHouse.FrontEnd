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
import { useCreateCategory, useUpdateCategory } from "../api/categories"
import { categorySchema, type CategoryFormValues } from "../schemas/category.schema"
import type { Category } from "../types"

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = create; a category = edit it. Remount (via `key`) when this changes so the form resets. */
  category: Category | null
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEdit = category !== null
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const isPending = createCategory.isPending || updateCategory.isPending
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      if (isEdit) {
        await updateCategory.mutateAsync({ id: category.id, ...values })
        toast.success("تم حفظ التعديلات")
      } else {
        await createCategory.mutateAsync(values)
        toast.success("تمت إضافة التصنيف")
      }
      onOpenChange(false)
    } catch (error) {
      if (!applyApiError(error, setError, { codeToField: { CATEGORY_NAME_EXISTS: "name" } })) {
        setFormError(toUserMessage(error))
      }
    }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "تعديل التصنيف" : "إضافة تصنيف"}
      description={
        isEdit ? "سيظهر الاسم الجديد على كل المنتجات في هذا التصنيف." : "اختر اسماً واضحاً، مثل: هواتف أو إكسسوارات."
      }
      submitLabel={isEdit ? "حفظ التعديلات" : "إضافة"}
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={isPending}
      error={formError}
    >
      <FormField id="category-name" label="اسم التصنيف" error={errors.name?.message}>
        <Input
          id="category-name"
          autoComplete="off"
          maxLength={255}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "category-name-error" : undefined}
          readOnly={isPending}
          {...register("name")}
        />
      </FormField>
    </FormDialog>
  )
}

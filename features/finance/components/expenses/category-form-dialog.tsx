"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { fieldA11y } from "@/lib/field-a11y"
import { useCreateExpenseCategory, useUpdateExpenseCategory } from "../../api/expenses"
import { categorySchema, type CategoryFormValues } from "../../schemas/expense.schema"
import type { ExpenseCategory } from "../../types"
import { useMoneyDialogSubmit } from "../cash/use-money-dialog"

type CategoryFormDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; category: ExpenseCategory | null }

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const create = useCreateExpenseCategory()
  const update = useUpdateExpenseCategory()
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? "", active: category?.active ?? true },
  })
  const { register, control, formState: { errors } } = form
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false), { EXPENSE_CATEGORY_NAME_EXISTS: "name" })
  const onSubmit = form.handleSubmit((v) =>
    category
      ? run(() => update.mutateAsync({ id: category.id, name: v.name.trim(), active: v.active, version: category.version }), "تم حفظ الفئة")
      : run(() => create.mutateAsync({ name: v.name.trim(), active: v.active }), "تمت إضافة الفئة"),
  )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "تعديل الفئة" : "إضافة فئة"}
      submitLabel={category ? "حفظ" : "إضافة"}
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={create.isPending || update.isPending}
      error={formError}
    >
      <FormField id="category-name" label="اسم الفئة" error={errors.name?.message}>
        <Input id="category-name" autoComplete="off" maxLength={100} placeholder="مثال: إيجار" {...fieldA11y("category-name", errors.name)} {...register("name")} />
      </FormField>
      {category?.system ? (
        <p className="small text-muted-foreground">يستخدم النظام هذه الفئة، فلا يمكن تعطيلها أو حذفها، لكن يمكن إعادة تسميتها.</p>
      ) : (
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="category-active">فعّالة</Label>
                <p className="small text-muted-foreground">الفئة غير الفعّالة لا تظهر عند إضافة مصروف.</p>
              </div>
              <Switch id="category-active" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      )}
    </FormDialog>
  )
}

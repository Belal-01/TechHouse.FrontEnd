"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { toUserMessage } from "@/lib/api/errors"
import { useDeleteCategory } from "../api/categories"
import type { Category } from "../types"

type DeleteCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}

export function DeleteCategoryDialog({ open, onOpenChange, category }: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    if (!category) return
    setError(null)
    try {
      await deleteCategory.mutateAsync(category.id)
      toast.success("تم حذف التصنيف")
      onOpenChange(false)
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`حذف التصنيف «${category?.name ?? ""}»؟`}
      description="سيُحذف التصنيف نهائياً. لا يمكن حذف تصنيف ما زالت فيه منتجات."
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      onConfirm={confirm}
      isPending={deleteCategory.isPending}
      error={error}
    />
  )
}

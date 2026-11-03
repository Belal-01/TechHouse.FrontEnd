"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { toUserMessage } from "@/lib/api/errors"
import { useDeleteProduct } from "../api/products"

type DeleteProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: { id: string; name: string } | null
  onDeleted?: () => void
}

export function DeleteProductDialog({ open, onOpenChange, product, onDeleted }: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    if (!product) return
    setError(null)
    try {
      await deleteProduct.mutateAsync(product.id)
      toast.success("تم حذف المنتج")
      onOpenChange(false)
      onDeleted?.()
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`حذف المنتج «${product?.name ?? ""}»؟`}
      description="سيُحذف المنتج وكل أنواعه من القائمة. لا يمكن التراجع عن هذا الإجراء."
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      onConfirm={confirm}
      isPending={deleteProduct.isPending}
      error={error}
    />
  )
}

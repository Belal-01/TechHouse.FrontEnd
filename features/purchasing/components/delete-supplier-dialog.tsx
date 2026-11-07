"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { toUserMessage } from "@/lib/api/errors"
import { useDeleteSupplier } from "../api/suppliers"
import type { Supplier } from "../types"

type DeleteSupplierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
}

export function DeleteSupplierDialog({ open, onOpenChange, supplier }: DeleteSupplierDialogProps) {
  const deleteSupplier = useDeleteSupplier()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    if (!supplier) return
    setError(null)
    try {
      await deleteSupplier.mutateAsync(supplier.id)
      toast.success("تم حذف المورد")
      onOpenChange(false)
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`حذف المورد «${supplier?.name ?? ""}»؟`}
      description="يُحذف المورد نهائياً. المورد الذي له فواتير لا يُحذف، بل يمكنك تعطيله."
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      onConfirm={confirm}
      isPending={deleteSupplier.isPending}
      error={error}
    />
  )
}

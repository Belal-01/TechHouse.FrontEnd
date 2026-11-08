"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { toUserMessage } from "@/lib/api/errors"
import { useDeleteDeliveryCompany } from "../api/delivery-companies"
import type { DeliveryCompany } from "../types"

type DeleteDeliveryCompanyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: DeliveryCompany | null
}

export function DeleteDeliveryCompanyDialog({ open, onOpenChange, company }: DeleteDeliveryCompanyDialogProps) {
  const remove = useDeleteDeliveryCompany()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    if (!company) return
    setError(null)
    try {
      await remove.mutateAsync(company.id)
      toast.success("تم حذف شركة التوصيل")
      onOpenChange(false)
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`حذف «${company?.name ?? ""}»؟`}
      description="تُحذف الشركة نهائياً. الشركة التي لها طلبات لا تُحذف، بل يمكنك تعطيلها."
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      onConfirm={confirm}
      isPending={remove.isPending}
      error={error}
    />
  )
}

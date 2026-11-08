"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api/errors"
import { useVoidExpense } from "../../api/expenses"
import type { Expense } from "../../types"

type VoidExpenseDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; expense: Expense | null }

export function VoidExpenseDialog({ open, onOpenChange, expense }: VoidExpenseDialogProps) {
  const voidExpense = useVoidExpense()
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    if (!expense) return
    setError(null)
    try {
      await voidExpense.mutateAsync({ id: expense.id, note })
      toast.success("أُلغي المصروف وعاد المبلغ إلى الصندوق")
      onOpenChange(false)
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إلغاء هذا المصروف؟"
      description="يبقى في السجل معلَّماً ملغى، ويعود المبلغ إلى الصندوق الذي دفعه. استخدمه لتصحيح إدخال خاطئ."
      confirmLabel="إلغاء المصروف"
      cancelLabel="رجوع"
      onConfirm={confirm}
      isPending={voidExpense.isPending}
      error={error}
    >
      <FormField id="void-expense-note" label="السبب" description="اختياري.">
        <Textarea id="void-expense-note" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
      </FormField>
    </ConfirmDialog>
  )
}

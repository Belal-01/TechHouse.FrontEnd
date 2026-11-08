"use client"

import { useState } from "react"
import { Ban } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api/errors"
import { useVoidInvoice } from "../api/invoices"

type VoidInvoiceButtonProps = { invoiceId: string; invoiceNumber: string }

/** Void an invoice entered by mistake, with a confirmation and an optional reason. */
export function VoidInvoiceButton({ invoiceId, invoiceNumber }: VoidInvoiceButtonProps) {
  const voidInvoice = useVoidInvoice(invoiceId)
  const [state, setState] = useState({ open: false, session: 0 })
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)
    try {
      await voidInvoice.mutateAsync(note)
      toast.success("أُلغيت الفاتورة وعاد المبلغ إلى الصندوق")
      setState((s) => ({ ...s, open: false }))
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          setNote("")
          setError(null)
          setState((s) => ({ open: true, session: s.session + 1 }))
        }}
      >
        <Ban aria-hidden />
        إلغاء الفاتورة
      </Button>
      <ConfirmDialog
        key={state.session}
        open={state.open}
        onOpenChange={(open) => setState((s) => ({ ...s, open }))}
        title={`إلغاء الفاتورة ${invoiceNumber}؟`}
        description="لتصحيح فاتورة أُدخلت بالخطأ: تخرج بضاعتها من المخزون، ويعود مبلغها إلى الصندوق الذي دفعه. تبقى في السجل معلَّمة ملغاة، ولا يمكن التراجع."
        confirmLabel="إلغاء الفاتورة"
        cancelLabel="رجوع"
        onConfirm={confirm}
        isPending={voidInvoice.isPending}
        error={error}
      >
        <FormField id="void-invoice-note" label="السبب" description="اختياري، مثل: أُدخلت مرتين.">
          <Textarea id="void-invoice-note" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </ConfirmDialog>
    </>
  )
}

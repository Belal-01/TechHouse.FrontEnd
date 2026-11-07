"use client"

import { useState } from "react"
import { ExternalLink, FileText, Paperclip, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FileButton } from "@/components/common/file-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toUserMessage } from "@/lib/api/errors"
import { invoiceAttachmentUrl, useDeleteInvoiceAttachment, useUploadInvoiceAttachment } from "../api/invoices"
import { checkInvoicePdf, PDF_ACCEPT } from "../lib/attachment"

type InvoiceAttachmentCardProps = {
  invoiceId: string
  hasAttachment: boolean
}

export function InvoiceAttachmentCard({ invoiceId, hasAttachment }: InvoiceAttachmentCardProps) {
  const upload = useUploadInvoiceAttachment()
  const remove = useDeleteInvoiceAttachment(invoiceId)
  const [removal, setRemoval] = useState<{ open: boolean; error: string | null }>({ open: false, error: null })

  const choose = async ([file]: File[]) => {
    const problem = checkInvoicePdf(file)
    if (problem) {
      toast.error(problem)
      return
    }
    try {
      await upload.mutateAsync({ invoiceId, file })
      toast.success("تم رفع الملف")
    } catch (error) {
      toast.error(toUserMessage(error))
    }
  }

  const confirmRemove = async () => {
    try {
      await remove.mutateAsync()
      toast.success("تم حذف الملف")
      setRemoval({ open: false, error: null })
    } catch (error) {
      setRemoval({ open: true, error: toUserMessage(error) })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ملف الفاتورة الأصلي</CardTitle>
        <CardDescription>{hasAttachment ? "نسخة PDF من فاتورة المورد." : "لا يوجد ملف مرفق."}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {hasAttachment ? (
          <>
            <a
              href={invoiceAttachmentUrl(invoiceId)}
              target="_blank"
              rel="noopener"
              className={buttonVariants({ variant: "outline" })}
            >
              <FileText aria-hidden />
              عرض الملف
              <ExternalLink className="text-muted-foreground" aria-hidden />
              <span className="sr-only">(يفتح في نافذة جديدة)</span>
            </a>
            <FileButton variant="ghost" accept={PDF_ACCEPT} onFiles={choose} disabled={upload.isPending}>
              <Paperclip aria-hidden />
              استبدال
            </FileButton>
            <Button variant="ghost" onClick={() => setRemoval({ open: true, error: null })}>
              <Trash2 aria-hidden />
              حذف
            </Button>
          </>
        ) : (
          <FileButton variant="outline" accept={PDF_ACCEPT} onFiles={choose} disabled={upload.isPending}>
            <Paperclip aria-hidden />
            {upload.isPending ? "جارٍ الرفع..." : "رفع ملف PDF"}
          </FileButton>
        )}
      </CardContent>

      <ConfirmDialog
        open={removal.open}
        onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
        title="حذف ملف الفاتورة؟"
        description="يُحذف ملف PDF فقط. بيانات الفاتورة والمخزون لا تتغير."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={confirmRemove}
        isPending={remove.isPending}
        error={removal.error}
      />
    </Card>
  )
}

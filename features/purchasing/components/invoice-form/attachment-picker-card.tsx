"use client"

import { FileText, Paperclip, X } from "lucide-react"
import { toast } from "sonner"
import { FileButton } from "@/components/common/file-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { checkInvoicePdf, PDF_ACCEPT } from "../../lib/attachment"

type AttachmentPickerCardProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

/** Chooses the supplier's PDF before the invoice exists; the form uploads it right after saving. */
export function AttachmentPickerCard({ file, onFileChange, disabled = false }: AttachmentPickerCardProps) {
  const choose = ([picked]: File[]) => {
    const problem = checkInvoicePdf(picked)
    if (problem) toast.error(problem)
    else onFileChange(picked)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ملف الفاتورة الأصلي</CardTitle>
        <CardDescription>اختياري. احفظ نسخة PDF من فاتورة المورد للرجوع إليها.</CardDescription>
      </CardHeader>
      <CardContent>
        {file ? (
          <div className="flex items-center justify-between gap-2 rounded-sm border px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 small">
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate" dir="auto">
                {file.name}
              </span>
            </span>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="إزالة الملف" disabled={disabled} onClick={() => onFileChange(null)}>
              <X aria-hidden />
            </Button>
          </div>
        ) : (
          <FileButton variant="outline" accept={PDF_ACCEPT} onFiles={choose} disabled={disabled}>
            <Paperclip aria-hidden />
            اختر ملف PDF
          </FileButton>
        )}
      </CardContent>
    </Card>
  )
}

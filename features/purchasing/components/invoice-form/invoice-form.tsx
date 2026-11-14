"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { ButtonLink } from "@/components/common/button-link"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FormPageHeader } from "@/components/common/form-page-header"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { useCurrentRate } from "@/features/finance"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatMoney } from "@/lib/format"
import { useCreateInvoice, useUploadInvoiceAttachment } from "../../api/invoices"
import { costUsd, emptyInvoiceForm, toInvoiceInput } from "../../lib/invoice-form"
import { allocateLandedCost } from "../../lib/landed-cost"
import { invoiceFormSchema, type InvoiceFormValues } from "../../schemas/invoice.schema"
import { AttachmentPickerCard } from "./attachment-picker-card"
import { CostsCard } from "./costs-card"
import { DetailsCard } from "./details-card"
import { LinesCard } from "./lines-card"
import { PaymentsCard } from "./payments-card"
import { SummaryCard } from "./summary-card"

/** Server field paths → form paths. items[0].productId arrives as items.0.productId; a payer's box or person is the payer field. */
function mapInvoiceField(path: string): string | null {
  if (/^items\.\d+\.(productId|quantity|unitPriceUsd)$/.test(path)) return path
  if (/^costs\.\d+\.(amount|description)$/.test(path)) return path
  const payer = /^((?:costs|payments)\.\d+)\.(accountId|partnerId)$/.exec(path)
  if (payer) return `${payer[1]}.payer`
  return ["supplierId", "invoiceDate", "status", "notes", "payments"].includes(path) ? path : null
}

const SUPPLIER_CODES = { SUPPLIER_NOT_FOUND: "supplierId", SUPPLIER_INACTIVE: "supplierId" } as const

export function InvoiceForm({ today }: { today: string }) {
  const router = useRouter()
  const createInvoice = useCreateInvoice()
  const uploadAttachment = useUploadInvoiceAttachment()
  const isPending = createInvoice.isPending || uploadAttachment.isPending
  const [file, setFile] = useState<File | null>(null)
  // Server errors stay until the next save; the "check the red fields" hint only while fields are still invalid.
  const [formError, setFormError] = useState<{ message: string; kind: "server" | "fields" } | null>(null)
  // Values waiting for the "this can't be edited later" confirmation.
  const [pending, setPending] = useState<{ values: InvoiceFormValues | null; open: boolean }>({ values: null, open: false })

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: emptyInvoiceForm(today),
    mode: "onTouched",
  })
  useUnsavedChangesWarning((form.formState.isDirty || file !== null) && !isPending)

  const rate = useCurrentRate()
  const hydrated = useHydrated()
  const sellRate = hydrated ? (rate.data?.current?.sellRate ?? null) : null
  const [items, costLines, status] = useWatch({ control: form.control, name: ["items", "costs", "status"] })
  const extraTotal = costLines.reduce((sum, cost) => sum + costUsd(cost, sellRate), 0)
  const costs = allocateLandedCost(
    items.map((line) => ({ quantity: Number(line.quantity), unitPrice: line.unitPriceUsd })),
    extraTotal.toFixed(4),
  )
  const itemsTotal = costs.reduce((sum, cost) => sum + (cost?.lineValue ?? 0), 0)
  const arrived = status === "RECEIVED"

  const hasFieldErrors = Object.keys(form.formState.errors).length > 0
  const visibleError = formError && (formError.kind === "server" || hasFieldErrors) ? formError.message : null

  const onSubmit = form.handleSubmit(
    (values) => {
      setFormError(null)
      setPending({ values, open: true })
    },
    () => setFormError({ message: "تحقّق من الحقول المعلّمة بالأحمر.", kind: "fields" }),
  )

  const save = async () => {
    if (!pending.values) return
    try {
      const invoice = await createInvoice.mutateAsync(toInvoiceInput(pending.values))
      form.reset(form.getValues())
      if (file) {
        try {
          await uploadAttachment.mutateAsync({ invoiceId: invoice.id, file })
        } catch (error) {
          toast.error(`حُفظت الفاتورة، لكن تعذّر رفع الملف: ${toUserMessage(error)} يمكنك رفعه من صفحة الفاتورة.`)
        }
      }
      setFile(null)
      toast.success(
        invoice.status === "RECEIVED"
          ? `تم حفظ الفاتورة ${invoice.invoiceNumber} وأُضيفت البضاعة إلى المخزون.`
          : `تم حفظ الفاتورة ${invoice.invoiceNumber} كبضاعة في الطريق. أكّد وصولها من صفحتها عندما تصل.`,
      )
      router.replace(`/purchasing/invoices/${invoice.id}`)
    } catch (error) {
      setPending((s) => ({ ...s, open: false }))
      if (!applyApiError(error, form.setError, { mapField: mapInvoiceField, codeToField: SUPPLIER_CODES })) {
        setFormError({ message: toUserMessage(error), kind: "server" })
      }
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-6">
        <FormPageHeader
          title="فاتورة شراء جديدة"
          backHref="/purchasing/invoices"
          backLabel="فواتير الشراء"
          actions={
            <>
              <ButtonLink variant="outline" href="/purchasing/invoices">
                إلغاء
              </ButtonLink>
              <Button type="submit" disabled={isPending}>
                {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                حفظ الفاتورة
              </Button>
            </>
          }
        />

        {visibleError ? <Alert>{visibleError}</Alert> : null}

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <LinesCard costs={costs} />
            <CostsCard sellRate={sellRate} />
            <PaymentsCard goodsTotal={itemsTotal} />
          </div>
          <div className="flex flex-col gap-6">
            <DetailsCard />
            <SummaryCard goodsTotal={itemsTotal} costsTotal={extraTotal} hasSyp={costLines.some((c) => c.currency === "SYP")} />
            <AttachmentPickerCard file={file} onFileChange={setFile} disabled={isPending} />
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={pending.open}
        onOpenChange={(open) => setPending((s) => ({ ...s, open }))}
        title="حفظ الفاتورة؟"
        description={
          <>
            إجمالي الفاتورة حتى الآن <span dir="ltr">{formatMoney(itemsTotal + extraTotal)}</span>.{" "}
            {arrived
              ? "بعد الحفظ تُضاف البضاعة إلى المخزون ويُسجَّل الدفع، ولا يمكن تعديل البنود."
              : "تُسجَّل كبضاعة في الطريق ويُسجَّل الدفع. عند وصولها تضيف الشحن البحري والجمارك من صفحة الفاتورة. لا يمكن تعديل البنود بعد الحفظ."}
          </>
        }
        confirmLabel="حفظ الفاتورة"
        cancelLabel="مراجعة"
        onConfirm={save}
        isPending={isPending}
      />
    </FormProvider>
  )
}

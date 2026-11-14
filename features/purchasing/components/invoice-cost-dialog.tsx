"use client"

import { useId, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { FormDialog } from "@/components/common/form-dialog"
import { useCurrentRate } from "@/features/finance"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { useAddInvoiceCost, useReceiveInvoice } from "../api/invoices"
import { emptyCost, toCostInput } from "../lib/invoice-form"
import { costsFormSchema, type CostsFormValues } from "../schemas/invoice.schema"
import { CostLinesEditor } from "./cost-lines-editor"

export function InvoiceCostDialog({ invoiceId, receive, onClose }: {
  invoiceId: string
  receive: boolean
  onClose: () => void
}) {
  const id = useId()
  const arrival = useReceiveInvoice(invoiceId)
  const addition = useAddInvoiceCost(invoiceId)
  const rate = useCurrentRate().data?.current?.sellRate ?? null
  const [error, setError] = useState<string | null>(null)
  const form = useForm<CostsFormValues>({
    resolver: zodResolver(costsFormSchema),
    defaultValues: { costs: receive ? [] : [emptyCost("OTHER")] },
  })

  const submit = form.handleSubmit(async ({ costs }) => {
    setError(null)
    try {
      if (receive) await arrival.mutateAsync(costs.map(toCostInput))
      else await addition.mutateAsync(toCostInput(costs[0]))
      onClose()
    } catch (error) {
      const handled = applyApiError(error, form.setError, {
        mapField: (field) => {
          const path = receive ? field : `costs.0.${field}`
          const match = /^(costs\.\d+)\.(amount|description|accountId|partnerId)$/.exec(path)
          if (!match) return null
          return `${match[1]}.${["amount", "description"].includes(match[2]) ? match[2] : "payer"}`
        },
      })
      if (!handled) setError(toUserMessage(error))
    }
  })

  return (
    <FormProvider {...form}>
      <FormDialog
        open
        onOpenChange={(open) => { if (!open) onClose() }}
        title={receive ? "استلام الفاتورة" : "إضافة تكلفة للفاتورة"}
        description={receive ? "سجّل تكاليف الوصول المدفوعة. تصبح كل القطع متاحة للبيع عند تأكيد الاستلام." : "بعد الاستلام تُوزّع التكلفة على القطع المتبقية في المستودع."}
        submitLabel={receive ? "تأكيد الاستلام" : "حفظ التكلفة"}
        cancelLabel="رجوع"
        onSubmit={submit}
        isPending={arrival.isPending || addition.isPending}
        error={error}
      >
        <CostLinesEditor idPrefix={id} newKind="SEA_FREIGHT" sellRate={rate} single={!receive} emptyText="أضف تكاليف الشحن البحري والجمارك إن وجدت." />
      </FormDialog>
    </FormProvider>
  )
}

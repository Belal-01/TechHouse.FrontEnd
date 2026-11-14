"use client"

import { useState } from "react"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { MoneyAmount } from "@/components/common/money-amount"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toUserMessage } from "@/lib/api/errors"
import { useRemoveInvoiceCost } from "../api/invoices"
import { COST_KIND_LABELS, SOURCE_LABELS } from "../lib/invoice-form"
import type { InvoiceCost, InvoiceDetail, InvoicePayment } from "../types"
import { AssignFundingDialog } from "./assign-funding-dialog"
import { InvoiceCostDialog } from "./invoice-cost-dialog"

export function InvoiceFundingSection({ invoice }: { invoice: InvoiceDetail }) {
  const [costDialog, setCostDialog] = useState(false)
  const [costToRemove, setCostToRemove] = useState<InvoiceCost | null>(null)
  const [paymentToAssign, setPaymentToAssign] = useState<InvoicePayment | null>(null)
  const removal = useRemoveInvoiceCost(invoice.id)
  const canAddCost = !invoice.voidedAt && (invoice.status === "IN_TRANSIT" || invoice.unitsInStock > 0)
  const costsById = new Map(invoice.costs.map((cost) => [cost.id, cost]))

  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      <Card>
        <CardHeader>
          <CardTitle>التكاليف</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          {invoice.costs.length === 0 ? <p className="small text-muted-foreground">لا تكاليف مسجّلة.</p> : null}
          <ul className="w-full divide-y">
            {invoice.costs.map((cost) => (
              <li key={cost.id} className="flex flex-wrap items-center justify-between gap-2 py-2 small">
                <div className="min-w-0 wrap-break-word">
                  <p>{COST_KIND_LABELS[cost.kind]}</p>
                  {cost.description ? <p className="text-muted-foreground">{cost.description}</p> : null}
                  {cost.afterReceipt ? <p className="text-muted-foreground">أضيفت بعد الاستلام</p> : null}
                </div>
                <MoneyAmount value={cost.amount} currency={cost.currency} />
                {cost.removable ? (
                  <Button variant="ghost" size="sm" onClick={() => { removal.reset(); setCostToRemove(cost) }}>حذف التكلفة</Button>
                ) : null}
              </li>
            ))}
          </ul>
          {canAddCost ? <Button variant="outline" onClick={() => setCostDialog(true)}>إضافة تكلفة</Button> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>الدفعات</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {invoice.payments.map((payment) => {
              const cost = payment.costId ? costsById.get(payment.costId) : undefined
              return (
                <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-2 small">
                  <div className="min-w-0 wrap-break-word">
                    <p>{payment.account?.name ?? payment.partner?.name ?? SOURCE_LABELS[payment.source]}</p>
                    <p className="text-muted-foreground">{cost ? COST_KIND_LABELS[cost.kind] : "ثمن البضاعة"}</p>
                  </div>
                  <MoneyAmount value={payment.amount} currency={payment.currency} />
                  {payment.source === "EXTERNAL" && !invoice.voidedAt ? (
                    <Button variant="outline" size="sm" onClick={() => setPaymentToAssign(payment)}>تحديد الدافع</Button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
      {costDialog ? <InvoiceCostDialog invoiceId={invoice.id} receive={false} onClose={() => setCostDialog(false)} /> : null}
      {paymentToAssign ? <AssignFundingDialog invoiceId={invoice.id} payment={paymentToAssign} onClose={() => setPaymentToAssign(null)} /> : null}
      {costToRemove ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => { if (!open) setCostToRemove(null) }}
          title="حذف التكلفة"
          description="تُزال التكلفة من الفاتورة وتُعكس دفعتها إذا خُصمت من صندوق المتجر."
          confirmLabel="حذف التكلفة"
          cancelLabel="رجوع"
          isPending={removal.isPending}
          error={removal.isError ? toUserMessage(removal.error) : null}
          onConfirm={() => removal.mutate(costToRemove.id, { onSuccess: () => setCostToRemove(null) })}
        />
      ) : null}
    </div>
  )
}

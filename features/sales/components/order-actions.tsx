"use client"

import { useState } from "react"
import { Ban, PackageCheck, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api/errors"
import { CashAccountSelect } from "@/features/finance"
import { useOrderTransition } from "../api/orders"
import { TRANSITIONS } from "../lib/order-status"
import type { OrderTransition } from "../types"

type Pending = { open: boolean; transition: OrderTransition; session: number }

/** The three final steps of a pending order, each confirmed with an optional note. */
export function OrderActions({ orderId }: { orderId: string }) {
  const change = useOrderTransition(orderId)
  const [pending, setPending] = useState<Pending>({ open: false, transition: "deliver", session: 0 })
  const [note, setNote] = useState("")
  // Where the money went: chosen every time (no default), as the owner asked.
  const [accountId, setAccountId] = useState("")
  const [accountError, setAccountError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ask = (transition: OrderTransition) => {
    setNote("")
    setAccountId("")
    setAccountError(null)
    setError(null)
    setPending((s) => ({ open: true, transition, session: s.session + 1 }))
  }
  const copy = TRANSITIONS[pending.transition]

  const confirm = async () => {
    setError(null)
    if (pending.transition === "deliver" && !accountId) {
      setAccountError("اختر الصندوق الذي وصل إليه المبلغ.")
      return
    }
    try {
      await change.mutateAsync({ transition: pending.transition, note, accountId: pending.transition === "deliver" ? accountId : undefined })
      toast.success(copy.success)
      setPending((s) => ({ ...s, open: false }))
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => ask("void")}>
        <Ban aria-hidden />
        {TRANSITIONS.void.label}
      </Button>
      <Button type="button" variant="outline" onClick={() => ask("return")}>
        <Undo2 aria-hidden />
        {TRANSITIONS.return.label}
      </Button>
      <Button type="button" onClick={() => ask("deliver")}>
        <PackageCheck aria-hidden />
        {TRANSITIONS.deliver.label}
      </Button>

      <ConfirmDialog
        key={pending.session}
        open={pending.open}
        onOpenChange={(open) => setPending((s) => ({ ...s, open }))}
        title={copy.title}
        description={copy.description}
        confirmLabel={copy.label}
        cancelLabel="رجوع"
        onConfirm={confirm}
        isPending={change.isPending}
        error={error}
      >
        {pending.transition === "deliver" ? (
          <FormField id="order-payment-account" label="وصل المبلغ إلى" error={accountError ?? undefined}>
            <CashAccountSelect
              id="order-payment-account"
              value={accountId}
              onValueChange={(value) => {
                setAccountId(value)
                setAccountError(null)
              }}
              aria-invalid={accountError ? true : undefined}
              aria-describedby={accountError ? "order-payment-account-error" : undefined}
            />
          </FormField>
        ) : null}
        <FormField id="order-transition-note" label="ملاحظة" description="اختياري.">
          <Textarea id="order-transition-note" rows={2} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
        </FormField>
      </ConfirmDialog>
    </>
  )
}

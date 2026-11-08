"use client"

import { useState } from "react"
import { Ban, PackageCheck, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api/errors"
import { useOrderTransition } from "../api/orders"
import { TRANSITIONS } from "../lib/order-status"
import type { OrderTransition } from "../types"

type Pending = { open: boolean; transition: OrderTransition; session: number }

/** The three final steps of a pending order, each confirmed with an optional note. */
export function OrderActions({ orderId }: { orderId: string }) {
  const change = useOrderTransition(orderId)
  const [pending, setPending] = useState<Pending>({ open: false, transition: "deliver", session: 0 })
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const ask = (transition: OrderTransition) => {
    setNote("")
    setError(null)
    setPending((s) => ({ open: true, transition, session: s.session + 1 }))
  }
  const copy = TRANSITIONS[pending.transition]

  const confirm = async () => {
    setError(null)
    try {
      await change.mutateAsync({ transition: pending.transition, note })
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
        <FormField id="order-transition-note" label="ملاحظة" description="اختياري.">
          <Textarea id="order-transition-note" rows={2} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
        </FormField>
      </ConfirmDialog>
    </>
  )
}

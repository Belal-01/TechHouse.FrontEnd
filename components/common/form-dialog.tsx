"use client"

import type { FormEventHandler, ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  submitLabel: string
  cancelLabel: string
  onSubmit: FormEventHandler<HTMLFormElement>
  isPending?: boolean
  /** Form-level error (field errors belong next to their fields). */
  error?: string | null
  children: ReactNode
}

/** Dialog that wraps any form: header, optional form error, fields, and cancel/submit footer. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  cancelLabel,
  onSubmit,
  isPending = false,
  error,
  children,
}: FormDialogProps) {
  return (
    // Keep the dialog open while a request is in flight.
    <Dialog open={open} onOpenChange={(next) => (isPending ? undefined : onOpenChange(next))}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate aria-busy={isPending} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          {error ? <Alert>{error}</Alert> : null}
          <div className="grid gap-4">{children}</div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              {cancelLabel}
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

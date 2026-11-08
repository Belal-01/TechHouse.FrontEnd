"use client"

import type { ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  isPending?: boolean
  /** Shown inside the dialog, e.g. why a delete was refused. */
  error?: string | null
  /** Extra content between the text and the buttons, e.g. an optional note field. */
  children?: ReactNode
}

/** Confirmation for irreversible actions. Stays open while pending and on error. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isPending = false,
  error,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => (isPending ? undefined : onOpenChange(next))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        {children}
        {error ? <Alert>{error}</Alert> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

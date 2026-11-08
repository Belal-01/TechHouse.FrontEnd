"use client"

import { useState } from "react"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { toast } from "sonner"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"

/**
 * The submit flow every money dialog shares: run the request, toast, close; on failure put field errors on the
 * form and anything else in the dialog's error slot.
 */
export function useMoneyDialogSubmit<T extends FieldValues>(
  setError: UseFormSetError<T>,
  onDone: () => void,
  codeToField: Partial<Record<string, Path<T>>> = {},
) {
  const [formError, setFormError] = useState<string | null>(null)
  const run = async (request: () => Promise<unknown>, success: string) => {
    setFormError(null)
    try {
      await request()
      toast.success(success)
      onDone()
    } catch (error) {
      if (!applyApiError(error, setError, { codeToField })) setFormError(toUserMessage(error))
    }
  }
  return { formError, run }
}

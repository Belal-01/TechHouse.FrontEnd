import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { ApiError, errorMessage } from "@/lib/api/errors"

type ApplyOptions<T extends FieldValues> = {
  /** Business codes that belong to one field, e.g. { CATEGORY_NAME_EXISTS: "name" }. */
  codeToField?: Partial<Record<string, Path<T>>>
  /**
   * Maps a server field path (already in dot form, e.g. "specifications.2.key") to the form's field path.
   * Return null for fields the form doesn't show; the error is then left for a form-level message.
   */
  mapField?: (serverField: string) => string | null
}

/** "specifications[2].key" → "specifications.2.key" (react-hook-form path syntax). */
export function toFormPath(serverField: string): string {
  return serverField.replace(/\[(\d+)]/g, ".$1")
}

/**
 * Puts a backend error onto the form fields it belongs to.
 * - Validation errors (`VALIDATION_ERROR`) get a generic Arabic message; the backend's texts are English.
 * - Business errors with a field get the Arabic message of their code.
 * Returns true if the error was shown on a field; otherwise show it as a form-level message.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  { codeToField = {}, mapField = (field) => field }: ApplyOptions<T> = {},
): boolean {
  if (!(error instanceof ApiError)) return false

  const message = error.code === "VALIDATION_ERROR" ? errorMessage("INVALID_FIELD") : error.userMessage
  let handled = false
  let focused = false

  for (const serverField of Object.keys(error.fieldErrors ?? {})) {
    const field = mapField(toFormPath(serverField))
    if (!field) continue
    setError(field as Path<T>, { type: "server", message }, { shouldFocus: !focused })
    focused = true
    handled = true
  }

  const codeField = codeToField[error.code]
  if (codeField) {
    setError(codeField, { type: "server", message: error.userMessage }, { shouldFocus: !focused })
    handled = true
  }
  return handled
}

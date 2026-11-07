import type { FieldError } from "react-hook-form"

/** aria-invalid + aria-describedby wiring between an input and the error rendered by FormField. */
export function fieldA11y(id: string, error: FieldError | undefined) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const
}

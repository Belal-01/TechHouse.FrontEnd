import type { ReactNode } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

type FormFieldProps = {
  id: string
  label: string
  error?: string
  description?: ReactNode
  children: ReactNode
}

// Label + control + error built on shadcn's Field. The error id matches the control's aria-describedby.
function FormField({ id, label, error, description, children }: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}

export { FormField }

"use client"

import { Controller, type Control, type FieldError, type FieldValues, type Path, type UseFormRegister } from "react-hook-form"
import { CurrencySelect } from "@/components/common/currency-select"
import { PriceInput } from "@/components/common/price-input"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { fieldA11y } from "@/lib/field-a11y"
import type { Currency } from "@/lib/currency"
import { CashAccountSelect } from "./cash-account-select"

// Field adapters shared by the money dialogs (boxes, expenses, advances), so each dialog is just a list of fields.

type ControlledProps<T extends FieldValues> = { control: Control<T>; name: Path<T>; id: string; label: string; error?: FieldError; description?: string }

export function AccountField<T extends FieldValues>({ control, name, id, label, error, description }: ControlledProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormField id={id} label={label} error={error?.message} description={description}>
          <CashAccountSelect id={id} value={field.value} onValueChange={field.onChange} {...fieldA11y(id, error)} />
        </FormField>
      )}
    />
  )
}

export function CurrencyField<T extends FieldValues>({ control, name, id, label, error }: ControlledProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormField id={id} label={label} error={error?.message}>
          <CurrencySelect id={id} value={field.value} onValueChange={field.onChange} />
        </FormField>
      )}
    />
  )
}

type RegisteredProps<T extends FieldValues> = { register: UseFormRegister<T>; name: Path<T>; id: string; label: string; error?: FieldError; description?: string }

export function AmountField<T extends FieldValues>({ register, name, id, label, error, currency, description }: RegisteredProps<T> & { currency: Currency }) {
  return (
    <FormField id={id} label={label} error={error?.message} description={description}>
      <PriceInput id={id} currency={currency} {...fieldA11y(id, error)} {...register(name)} />
    </FormField>
  )
}

export function NoteField<T extends FieldValues>({ register, name, id, label, error, description }: RegisteredProps<T>) {
  return (
    <FormField id={id} label={label} error={error?.message} description={description}>
      <Textarea id={id} rows={2} maxLength={1000} {...fieldA11y(id, error)} {...register(name)} />
    </FormField>
  )
}

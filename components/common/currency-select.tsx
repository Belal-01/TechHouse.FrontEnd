"use client"

import type { ComponentProps } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CURRENCY_ITEMS, type Currency } from "@/lib/currency"

type CurrencySelectProps = Omit<ComponentProps<typeof SelectTrigger>, "children"> & {
  value: Currency
  onValueChange: (value: Currency) => void
}

/** USD / SYP picker. Pass `id` and aria props for the trigger, as with any field. */
export function CurrencySelect({ value, onValueChange, className, ...triggerProps }: CurrencySelectProps) {
  return (
    <Select items={CURRENCY_ITEMS} value={value} onValueChange={(next) => next && onValueChange(next as Currency)}>
      <SelectTrigger className={className ?? "w-full"} {...triggerProps}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

"use client"

import type { ComponentProps } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeliveryCompanies } from "../api/delivery-companies"

export const NO_COMPANY = ""

type DeliveryCompanySelectProps = Omit<ComponentProps<typeof SelectTrigger>, "children"> & {
  value: string
  onValueChange: (value: string) => void
  emptyLabel: string
}

/** Active delivery companies, plus the current value even if it was deactivated since. */
export function DeliveryCompanySelect({ value, onValueChange, emptyLabel, ...triggerProps }: DeliveryCompanySelectProps) {
  const companies = useDeliveryCompanies()
  const items = [
    { value: NO_COMPANY, label: emptyLabel },
    ...(companies.data ?? [])
      .filter((company) => company.active || company.id === value)
      .map((company) => ({ value: company.id, label: company.name })),
  ]
  return (
    <Select items={items} value={value} onValueChange={(next) => onValueChange(next ?? NO_COMPANY)}>
      <SelectTrigger {...triggerProps}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value || "none"} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

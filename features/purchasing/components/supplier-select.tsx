"use client"

import type { ComponentProps } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSuppliers } from "../api/suppliers"

/** Value used for "no supplier" / "all suppliers"; Select items need a string value. */
export const NO_SUPPLIER = ""

type SupplierSelectProps = Omit<ComponentProps<typeof SelectTrigger>, "children"> & {
  value: string
  onValueChange: (value: string) => void
  /** Label of the empty choice, e.g. "بدون مورد" or "كل الموردين". */
  emptyLabel: string
  /** Only active suppliers (for new invoices). The current value stays selectable either way. */
  activeOnly?: boolean
}

export function SupplierSelect({ value, onValueChange, emptyLabel, activeOnly = false, ...triggerProps }: SupplierSelectProps) {
  const suppliers = useSuppliers({ search: "", active: activeOnly ? true : null })
  const items = [
    { value: NO_SUPPLIER, label: emptyLabel },
    ...(suppliers.data ?? []).map((supplier) => ({ value: supplier.id, label: supplier.name })),
  ]

  return (
    <Select items={items} value={value} onValueChange={(next) => onValueChange(next ?? NO_SUPPLIER)}>
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

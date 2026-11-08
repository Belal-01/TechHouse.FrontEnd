"use client"

import type { ComponentProps } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExpenseCategories } from "../api/expenses"

type ExpenseCategorySelectProps = Omit<ComponentProps<typeof SelectTrigger>, "children"> & {
  value: string
  onValueChange: (value: string) => void
  /** Adds an empty choice (e.g. "كل الفئات" in filters). */
  emptyLabel?: string
}

export function ExpenseCategorySelect({ value, onValueChange, emptyLabel, className, ...props }: ExpenseCategorySelectProps) {
  const categories = useExpenseCategories()
  const items = [
    ...(emptyLabel !== undefined ? [{ value: "", label: emptyLabel }] : []),
    ...(categories.data ?? []).filter((c) => c.active || c.id === value || emptyLabel !== undefined).map((c) => ({ value: c.id, label: c.name })),
  ]
  return (
    <Select items={items} value={value} onValueChange={(next) => onValueChange(next ?? "")}>
      <SelectTrigger className={className ?? "w-full"} {...props}>
        <SelectValue placeholder="اختر الفئة" />
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

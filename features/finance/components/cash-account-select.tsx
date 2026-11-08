"use client"

import type { ComponentProps } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCashAccounts } from "../api/cash"

type CashAccountSelectProps = Omit<ComponentProps<typeof SelectTrigger>, "children"> & {
  value: string
  onValueChange: (value: string) => void
  /** Adds an empty choice with this label (e.g. "كل الصناديق" in filters). */
  emptyLabel?: string
  placeholder?: string
}

/** Active boxes ("في يدي", "شام كاش"...), plus the current value even if it was deactivated since. */
export function CashAccountSelect({ value, onValueChange, emptyLabel, placeholder = "اختر الصندوق", className, ...props }: CashAccountSelectProps) {
  const accounts = useCashAccounts()
  const items = [
    ...(emptyLabel !== undefined ? [{ value: "", label: emptyLabel }] : []),
    ...(accounts.data ?? []).filter((a) => a.active || a.id === value).map((a) => ({ value: a.id, label: a.name })),
  ]
  return (
    <Select items={items} value={value} onValueChange={(next) => onValueChange(next ?? "")}>
      <SelectTrigger className={className ?? "w-full"} {...props}>
        {/* With an empty choice, "" is a real option and shows its own label; the placeholder would hide it. */}
        <SelectValue placeholder={emptyLabel === undefined ? placeholder : undefined} />
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

"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PERIOD_LABELS, PERIODS, type PeriodKey } from "../lib/periods"

type PeriodPickerProps = {
  period: PeriodKey
  from: string
  to: string
  onChange: (next: { period: PeriodKey; from?: string; to?: string }) => void
}

const ITEMS = PERIODS.map((value) => ({ value, label: PERIOD_LABELS[value] }))

export function PeriodPicker({ period, from, to, onChange }: PeriodPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select items={ITEMS} value={period} onValueChange={(value) => value && onChange({ period: value as PeriodKey })}>
        <SelectTrigger aria-label="الفترة" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {period === "custom" ? (
        <>
          <Input type="date" dir="ltr" aria-label="من تاريخ" className="w-40" value={from} max={to} onChange={(e) => e.target.value && onChange({ period, from: e.target.value, to })} />
          <Input type="date" dir="ltr" aria-label="إلى تاريخ" className="w-40" value={to} min={from} onChange={(e) => e.target.value && onChange({ period, from, to: e.target.value })} />
        </>
      ) : null}
    </div>
  )
}

"use client"

import type { ComponentProps } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCashAccounts, usePartners } from "@/features/finance"
import { DEFAULT_PAYER, payerValue } from "../lib/invoice-form"

type PayerSelectProps = Omit<ComponentProps<typeof SelectTrigger>, "children"> & {
  value: string
  onValueChange: (value: string) => void
  /** Only people (owners and investors), e.g. when assigning outside money. */
  peopleOnly?: boolean
}

type Option = { value: string; label: string }

/**
 * Who pays: a store box, a company owner or an investor. Values are "ACCOUNT:<id>" ("ACCOUNT:" = the default box),
 * "OWNER:<id>" or "INVESTOR:<id>".
 */
export function PayerSelect({ value, onValueChange, peopleOnly = false, className, ...props }: PayerSelectProps) {
  const accounts = useCashAccounts().data ?? []
  const partners = usePartners().data ?? []
  const defaultBox = accounts.find((a) => a.isDefault)
  const visible = (active: boolean, v: string) => active || v === value

  const groups: { label: string; options: Option[] }[] = [
    {
      label: "صناديق المتجر",
      options: peopleOnly
        ? []
        : [
            { value: DEFAULT_PAYER, label: defaultBox ? `${defaultBox.name} (الافتراضي)` : "الصندوق الافتراضي" },
            ...accounts
              .filter((a) => !a.isDefault && visible(a.active, payerValue("ACCOUNT", a.id)))
              .map((a) => ({ value: payerValue("ACCOUNT", a.id), label: a.name })),
          ],
    },
    {
      label: "أصحاب الشركة",
      options: partners
        .filter((p) => p.kind === "OWNER" && visible(p.active, payerValue("OWNER", p.id)))
        .map((p) => ({ value: payerValue("OWNER", p.id), label: p.name })),
    },
    {
      label: "المستثمرون",
      options: partners
        .filter((p) => p.kind === "INVESTOR" && visible(p.active, payerValue("INVESTOR", p.id)))
        .map((p) => ({ value: payerValue("INVESTOR", p.id), label: p.name })),
    },
  ].filter((group) => group.options.length > 0)

  // The default box picked explicitly is the same choice as "the default box".
  const current = defaultBox && value === payerValue("ACCOUNT", defaultBox.id) ? DEFAULT_PAYER : value
  return (
    <Select items={groups.flatMap((g) => g.options)} value={current} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger className={className ?? "w-full"} {...props}>
        <SelectValue placeholder="اختر من دفع" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

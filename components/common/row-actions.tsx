"use client"

import type { LucideIcon } from "lucide-react"
import { Ellipsis } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type RowAction = {
  label: string
  onSelect: () => void
  icon?: LucideIcon
  variant?: "default" | "destructive"
  disabled?: boolean
}

type RowActionsProps = {
  actions: RowAction[]
  /** Accessible name of the trigger, e.g. "إجراءات هواتف". */
  label: string
}

/** Per-row action menu driven by an `actions` config. */
export function RowActions({ actions, label }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} />}>
        <Ellipsis aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {actions.map(({ label: actionLabel, onSelect, icon: Icon, variant, disabled }) => (
          <DropdownMenuItem key={actionLabel} variant={variant} disabled={disabled} onClick={onSelect}>
            {Icon ? <Icon aria-hidden /> : null}
            {actionLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

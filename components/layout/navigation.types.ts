import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type NavLink = {
  title: string
  href: string
  icon?: LucideIcon
  badge?: ReactNode
  /** Planned but not built yet: rendered dimmed, not clickable. */
  disabled?: boolean
}

export type NavBranch = {
  title: string
  icon: LucideIcon
  items: NavLink[]
}

export type NavEntry = NavLink | NavBranch

export type NavGroup = {
  label?: string
  items: NavEntry[]
}

export function isBranch(entry: NavEntry): entry is NavBranch {
  return "items" in entry
}

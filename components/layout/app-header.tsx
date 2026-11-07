import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

type AppHeaderProps = {
  /** Always-visible status next to the menu button, e.g. today's exchange rate. */
  status?: ReactNode
  /** End-side controls, e.g. the profile menu. */
  actions?: ReactNode
}

// Shared top bar. Feature UI is injected through slots, so this component never depends on a feature.
export function AppHeader({ status, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4 lg:px-6">
      <SidebarTrigger />
      {status ? <div className="flex min-w-0 items-center">{status}</div> : null}
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {actions}
      </div>
    </header>
  )
}

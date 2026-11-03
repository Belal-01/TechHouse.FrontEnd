import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Shared top bar. Feature UI (e.g. the profile menu) is injected through `actions`,
// so this component never depends on a feature.
export function AppHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4 lg:px-6">
      <SidebarTrigger />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {actions}
      </div>
    </header>
  )
}

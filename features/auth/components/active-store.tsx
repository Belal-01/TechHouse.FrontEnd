import { Store } from "lucide-react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { regionName } from "@/lib/format"
import { requireSession } from "../server/require-session"

/** The store the dashboard is scoped to. Will become the store switcher once there are several stores. */
export async function ActiveStore() {
  const { activeStore } = await requireSession()
  if (!activeStore) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={activeStore.name}
          render={<div />}
          className="cursor-default hover:bg-transparent active:bg-transparent"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-tint text-blue">
            <Store className="size-4" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{activeStore.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {regionName(activeStore.countryCode)} · {activeStore.localCurrency}
            </span>
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function ActiveStoreSkeleton() {
  return <Skeleton className="h-12 w-full" />
}

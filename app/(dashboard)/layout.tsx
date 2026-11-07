import { Suspense, type ReactNode } from "react"
import { cookies } from "next/headers"
import { AppHeader } from "@/components/layout/app-header"
import { AppShellSkeleton } from "@/components/layout/app-shell-skeleton"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar.constants"
import { ActiveStore, ActiveStoreSkeleton, UserMenu, UserMenuSkeleton } from "@/features/auth/server"
import { ExchangeRateIndicator } from "@/features/finance"
import { DashboardSidebar } from "./_components/dashboard-sidebar"

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
}

// Reads the saved sidebar state (open / collapsed) so the server renders it correctly, with no flash.
// Cookie reads are request-time data, hence the Suspense boundary above.
async function DashboardShell({ children }: { children: ReactNode }) {
  const sidebarOpen = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value !== "false"

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <DashboardSidebar
        footer={
          <Suspense fallback={<ActiveStoreSkeleton />}>
            <ActiveStore />
          </Suspense>
        }
      />
      <SidebarInset>
        <AppHeader
          status={<ExchangeRateIndicator />}
          actions={
            <Suspense fallback={<UserMenuSkeleton />}>
              <UserMenu />
            </Suspense>
          }
        />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

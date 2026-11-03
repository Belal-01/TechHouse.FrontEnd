"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { dashboardNavigation } from "@/config/navigation"

// Client wrapper: the navigation config holds icon components, which can't be passed from a Server Component.
export function DashboardSidebar({ footer }: { footer?: ReactNode }) {
  return (
    <AppSidebar
      side="right" // RTL: the sidebar sits on the start (right) edge.
      navigation={dashboardNavigation}
      disabledLabel="قريباً"
      header={
        // The logo isn't shrunk into the icon rail (brand rule), so it's hidden when collapsed.
        <Link href="/" aria-label="الصفحة الرئيسية" className="flex h-12 items-center px-2 group-data-[collapsible=icon]:hidden">
          <Logo className="h-11" />
        </Link>
      }
      footer={footer}
    />
  )
}

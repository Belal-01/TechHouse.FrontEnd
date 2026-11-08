import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/common/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { requireSession } from "@/features/auth/server"
import { DashboardView } from "@/features/dashboard"

export const metadata: Metadata = {
  title: "لوحة التحكم",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="لوحة التحكم"
        description={
          <Suspense fallback={<Skeleton className="h-5 w-56" />}>
            <Greeting />
          </Suspense>
        }
      />
      {/* The period is read from the URL (request-time data). */}
      <Suspense>
        <DashboardView />
      </Suspense>
    </div>
  )
}

async function Greeting() {
  const { user, activeStore } = await requireSession()
  return (
    <>
      أهلاً، {user.displayName}
      {activeStore ? ` · ${activeStore.name}` : null}
    </>
  )
}

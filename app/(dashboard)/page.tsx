import type { Metadata } from "next"
import { Suspense } from "react"
import { ChartNoAxesCombined } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { requireSession } from "@/features/auth/server"

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
      <EmptyState
        icon={ChartNoAxesCombined}
        title="لا توجد بيانات بعد"
        description="ستظهر هنا مؤشرات الإيراد والربح والكاش والمخزون بعد إدخال أول فاتورة شراء وأول طلب."
      />
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

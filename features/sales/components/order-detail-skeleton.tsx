import { Skeleton } from "@/components/ui/skeleton"

export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="جارٍ التحميل">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 w-full lg:col-span-2" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

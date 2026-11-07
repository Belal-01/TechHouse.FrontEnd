import { Skeleton } from "@/components/ui/skeleton"

export function InvoiceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="جارٍ التحميل">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

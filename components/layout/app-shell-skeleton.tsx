import { Skeleton } from "@/components/ui/skeleton"

/** Static placeholder shown while the session-dependent shell streams in. */
export function AppShellSkeleton() {
  return (
    <div className="flex min-h-svh" aria-hidden>
      <div className="hidden w-64 shrink-0 flex-col gap-4 border-e bg-sidebar p-4 md:flex">
        <Skeleton className="h-10 w-32" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <Skeleton className="size-8" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PersonDetailView } from "@/features/finance"

export const metadata: Metadata = {
  title: "السلف",
}

export default function PersonPage({ params }: PageProps<"/finance/advances/[personId]">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <PersonRoute params={params} />
    </Suspense>
  )
}

async function PersonRoute({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params
  return <PersonDetailView personId={personId} />
}

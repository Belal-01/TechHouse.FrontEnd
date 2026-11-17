import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { InvestorSettlementView } from "@/features/finance"

export const metadata: Metadata = { title: "تسوية المستثمر" }

export default function InvestorPage({ params }: PageProps<"/finance/partners/[partnerId]">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <InvestorRoute params={params} />
    </Suspense>
  )
}

async function InvestorRoute({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params
  return <InvestorSettlementView investorId={partnerId} />
}

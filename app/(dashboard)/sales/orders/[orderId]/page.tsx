import type { Metadata } from "next"
import { Suspense } from "react"
import { OrderDetailSkeleton, OrderDetailView } from "@/features/sales"

export const metadata: Metadata = {
  title: "طلب",
}

export default function OrderPage({ params }: PageProps<"/sales/orders/[orderId]">) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderRoute params={params} />
    </Suspense>
  )
}

async function OrderRoute({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  return <OrderDetailView orderId={orderId} />
}

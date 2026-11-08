import type { Metadata } from "next"
import { Suspense } from "react"
import { OrdersView } from "@/features/sales"

export const metadata: Metadata = {
  title: "الطلبات",
}

// OrdersView reads its filters from the URL (search params), which is request-time data.
export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  )
}

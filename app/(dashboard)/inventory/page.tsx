import type { Metadata } from "next"
import { Suspense } from "react"
import { InventoryView } from "@/features/inventory"

export const metadata: Metadata = {
  title: "المخزون",
}

// The search and filter live in the URL (request-time data).
export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryView />
    </Suspense>
  )
}

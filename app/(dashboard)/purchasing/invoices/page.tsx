import type { Metadata } from "next"
import { Suspense } from "react"
import { InvoicesView } from "@/features/purchasing"

export const metadata: Metadata = {
  title: "فواتير الشراء",
}

// InvoicesView reads its filter from the URL (search params), which is request-time data.
export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesView />
    </Suspense>
  )
}

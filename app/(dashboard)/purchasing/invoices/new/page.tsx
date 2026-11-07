import type { Metadata } from "next"
import { Suspense } from "react"
import { InvoiceCreateView } from "@/features/purchasing"

export const metadata: Metadata = {
  title: "فاتورة شراء جديدة",
}

// The form defaults to today's date, which is request-time data.
export default function NewInvoicePage() {
  return (
    <Suspense>
      <InvoiceCreateView />
    </Suspense>
  )
}

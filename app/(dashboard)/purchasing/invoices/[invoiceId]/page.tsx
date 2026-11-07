import type { Metadata } from "next"
import { Suspense } from "react"
import { InvoiceDetailSkeleton, InvoiceDetailView } from "@/features/purchasing"

export const metadata: Metadata = {
  title: "فاتورة شراء",
}

export default function InvoicePage({ params }: PageProps<"/purchasing/invoices/[invoiceId]">) {
  return (
    <Suspense fallback={<InvoiceDetailSkeleton />}>
      <InvoiceRoute params={params} />
    </Suspense>
  )
}

async function InvoiceRoute({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params
  return <InvoiceDetailView invoiceId={invoiceId} />
}

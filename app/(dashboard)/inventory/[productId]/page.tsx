import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductStockView } from "@/features/inventory"

export const metadata: Metadata = {
  title: "المخزون",
}

export default function ProductStockPage({ params }: PageProps<"/inventory/[productId]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ProductStockRoute params={params} />
    </Suspense>
  )
}

async function ProductStockRoute({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  return <ProductStockView productId={productId} />
}

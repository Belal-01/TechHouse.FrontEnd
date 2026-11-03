import type { Metadata } from "next"
import { Suspense } from "react"
import { ProductEditView, ProductFormSkeleton } from "@/features/catalog"

export const metadata: Metadata = {
  title: "تعديل منتج",
}

export default function ProductPage({ params }: PageProps<"/catalog/products/[productId]">) {
  return (
    <Suspense fallback={<ProductFormSkeleton />}>
      <ProductRoute params={params} />
    </Suspense>
  )
}

async function ProductRoute({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  return <ProductEditView productId={productId} />
}

import type { Metadata } from "next"
import { Suspense } from "react"
import { ProductsView } from "@/features/catalog"

export const metadata: Metadata = {
  title: "المنتجات",
}

// ProductsView reads its filters from the URL (search params), which is request-time data.
export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsView />
    </Suspense>
  )
}

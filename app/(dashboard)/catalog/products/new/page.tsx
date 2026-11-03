import type { Metadata } from "next"
import { ProductCreateView } from "@/features/catalog"

export const metadata: Metadata = {
  title: "منتج جديد",
}

export default function NewProductPage() {
  return <ProductCreateView />
}

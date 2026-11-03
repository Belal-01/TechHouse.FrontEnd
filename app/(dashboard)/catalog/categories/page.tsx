import type { Metadata } from "next"
import { CategoriesView } from "@/features/catalog"

export const metadata: Metadata = {
  title: "التصنيفات",
}

export default function CategoriesPage() {
  return <CategoriesView />
}

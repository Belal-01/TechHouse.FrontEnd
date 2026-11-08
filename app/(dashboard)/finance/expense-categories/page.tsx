import type { Metadata } from "next"
import { ExpenseCategoriesView } from "@/features/finance"

export const metadata: Metadata = {
  title: "فئات المصاريف",
}

export default function Page() {
  return <ExpenseCategoriesView />
}

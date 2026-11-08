import type { Metadata } from "next"
import { ExpensesView } from "@/features/finance"

export const metadata: Metadata = {
  title: "المصاريف",
}

export default function Page() {
  return <ExpensesView />
}

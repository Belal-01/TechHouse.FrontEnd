import type { Metadata } from "next"
import { PartnersView } from "@/features/finance"

export const metadata: Metadata = {
  title: "الشركاء والمستثمرون",
}

export default function Page() {
  return <PartnersView />
}

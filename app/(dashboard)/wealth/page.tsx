import type { Metadata } from "next"
import { WealthView } from "@/features/dashboard"

export const metadata: Metadata = {
  title: "الثروة",
}

export default function WealthPage() {
  return <WealthView />
}

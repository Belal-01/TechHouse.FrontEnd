import type { Metadata } from "next"
import { WalletsView } from "@/features/finance"

export const metadata: Metadata = {
  title: "الصناديق",
}

export default function Page() {
  return <WalletsView />
}

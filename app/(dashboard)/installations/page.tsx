import type { Metadata } from "next"
import { InstallationsView } from "@/features/installations"

export const metadata: Metadata = { title: "تركيب نقاط الشحن" }

export default function InstallationsPage() {
  return <InstallationsView />
}

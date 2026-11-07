import type { Metadata } from "next"
import { SuppliersView } from "@/features/purchasing"

export const metadata: Metadata = {
  title: "الموردون",
}

export default function SuppliersPage() {
  return <SuppliersView />
}

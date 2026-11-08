import type { Metadata } from "next"
import { DeliveryCompaniesView } from "@/features/sales"

export const metadata: Metadata = {
  title: "شركات التوصيل",
}

export default function DeliveryCompaniesPage() {
  return <DeliveryCompaniesView />
}

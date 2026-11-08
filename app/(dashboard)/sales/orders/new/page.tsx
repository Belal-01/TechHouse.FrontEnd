import type { Metadata } from "next"
import { OrderCreateView } from "@/features/sales"

export const metadata: Metadata = {
  title: "طلب جديد",
}

export default function NewOrderPage() {
  return <OrderCreateView />
}

import type { Metadata } from "next"
import { ExchangeRatesView } from "@/features/finance"

export const metadata: Metadata = {
  title: "أسعار الصرف",
}

export default function ExchangeRatesPage() {
  return <ExchangeRatesView />
}

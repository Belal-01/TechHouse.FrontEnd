import { Badge } from "@/components/ui/badge"
import { PAID_FROM_LABELS } from "../lib/invoice-form"
import type { PaidFrom } from "../types"

export function PaidFromBadge({ paidFrom }: { paidFrom: PaidFrom }) {
  return <Badge variant={paidFrom === "INCOME" ? "secondary" : "info"}>{PAID_FROM_LABELS[paidFrom]}</Badge>
}

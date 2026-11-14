import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "../lib/invoice-form"
import type { InvoiceStatus } from "../types"

/** On the way (blue) or arrived (gray); a voided invoice shows "ملغاة" instead. */
export function InvoiceStatusBadge({ status, voided = false }: { status: InvoiceStatus; voided?: boolean }) {
  if (voided) return <Badge variant="destructive">ملغاة</Badge>
  return <Badge variant={status === "IN_TRANSIT" ? "info" : "secondary"}>{STATUS_LABELS[status]}</Badge>
}

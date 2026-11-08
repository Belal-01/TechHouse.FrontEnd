import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_LABELS } from "../lib/order-status"
import type { OrderStatus } from "../types"

const VARIANT = { PENDING: "info", DELIVERED: "secondary", RETURNED: "outline", VOIDED: "destructive" } as const

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
}

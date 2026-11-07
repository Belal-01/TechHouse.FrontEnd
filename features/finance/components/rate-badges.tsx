import { Badge } from "@/components/ui/badge"
import type { RateSource, RateStatus } from "../types"

export function RateSourceBadge({ source }: { source: RateSource }) {
  return source === "API" ? <Badge variant="info">تلقائي</Badge> : <Badge variant="outline">يدوي</Badge>
}

export function RateStatusBadge({ status }: { status: RateStatus }) {
  return status === "ACTIVE" ? <Badge variant="secondary">معتمد</Badge> : <Badge variant="destructive">بانتظار المراجعة</Badge>
}

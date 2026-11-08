import { Badge } from "@/components/ui/badge"
import type { StockItem } from "../types"

/** نفد / قارب على النفاد / متوفر / لم يُشترَ بعد. */
export function StockStatusBadge({ item }: { item: StockItem }) {
  if (!item.stocked) return <Badge variant="outline">لم يُشترَ بعد</Badge>
  if (item.available === 0) return <Badge variant="destructive">نفد</Badge>
  if (item.low) return <Badge variant="destructive">قارب على النفاد</Badge>
  return <Badge variant="info">متوفر</Badge>
}

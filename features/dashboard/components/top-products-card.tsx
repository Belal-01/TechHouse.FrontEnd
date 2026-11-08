import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney, formatQuantity } from "@/lib/format"
import type { Dashboard } from "../types"

export function TopProductsCard({ products }: { products: Dashboard["topProducts"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الأكثر ربحاً</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="small text-muted-foreground">لا مبيعات مسلَّمة في هذه الفترة.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {products.map((p) => (
              <li key={p.productId} className="flex items-baseline justify-between gap-3 small">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatQuantity(p.quantity)} قطعة · إيراد <span dir="ltr">{formatMoney(p.revenueUsd)}</span>
                  </span>
                </span>
                <span dir="ltr" className={p.profitUsd < 0 ? "shrink-0 text-red" : "shrink-0 font-semibold text-foreground"}>
                  {formatMoney(p.profitUsd)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

import { StatTile } from "@/components/common/stat-tile"
import { formatMoney, formatQuantity } from "@/lib/format"
import type { Dashboard } from "../types"
import { ProfitShareTile } from "./profit-share-tile"

const usd = (value: number) => <span dir="ltr">{formatMoney(value)}</span>

/** The four headline numbers, then everything the shop owns. */
export function KpiTiles({ data }: { data: Dashboard }) {
  const { pnl, wealth, pending } = data
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="صافي الربح"
          value={usd(pnl.netProfitUsd)}
          tone={pnl.netProfitUsd < 0 ? "negative" : "default"}
          hint={<>{formatQuantity(pnl.deliveredOrders)} طلب مسلَّم في الفترة</>}
        />
        <StatTile label="الكاش" value={usd(wealth.cashUsd)} hint="كل الصناديق، الآن" href="/finance/wallets" />
        <StatTile
          label="قيمة المخزون"
          value={usd(wealth.inventoryUsd + wealth.inTransitUsd)}
          hint={<>منها {usd(wealth.inTransitUsd)} مع الزبائن</>}
          href="/wealth"
        />
        <StatTile
          label="طلبات قيد التوصيل"
          value={formatQuantity(pending.count)}
          hint={pending.count > 0 ? <>ربح متوقع {usd(pending.expectedProfitUsd)}</> : "لا طلبات معلّقة"}
          href="/sales/orders?status=PENDING"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ProfitShareTile share={data.profitShare} netProfitUsd={pnl.netProfitUsd} />
        <StatTile
          className="lg:col-span-2"
          label="كل ما يملكه المتجر"
          value={usd(wealth.totalUsd)}
          tone="accent"
          hint={
            <>
              كاش {usd(wealth.cashUsd)} · مخزون {usd(wealth.inventoryUsd + wealth.inTransitUsd)} · مشتريات في الطريق {usd(wealth.incomingUsd)} · سلف {usd(wealth.advancesUsd)}
              {wealth.sypExcluded ? " · الليرة غير محسوبة: لا يوجد سعر صرف" : null}
            </>
          }
          href="/wealth"
        />
      </div>
    </div>
  )
}

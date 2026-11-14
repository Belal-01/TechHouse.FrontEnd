// Mirrors com.techhouse.reporting.web.DashboardDtos. All amounts in USD; SYP valued at the current sell rate.

export type Rate = { sellRate?: number | null; rateDate?: string | null; stale: boolean; pendingReview: boolean }

export type WealthTotals = {
  cashUsd: number
  inventoryUsd: number
  inTransitUsd: number
  incomingUsd: number
  advancesUsd: number
  totalUsd: number
  /** No exchange rate yet: SYP amounts could not be counted. */
  sypExcluded: boolean
}

export type Dashboard = {
  period: { from: string; to: string }
  pnl: { revenueUsd: number; cogsUsd: number; grossProfitUsd: number; expensesUsd: number; netProfitUsd: number; deliveredOrders: number }
  /** percent of the period's net profit (0 when there is no profit). */
  profitShare: { label: string; percent: number; amountUsd: number }
  wealth: WealthTotals
  pending: { count: number; revenueUsd: number; expectedProfitUsd: number }
  series: { date: string; revenueUsd: number; netProfitUsd: number }[]
  seriesUnit: "DAY" | "MONTH"
  topProducts: { productId: string; name: string; quantity: number; revenueUsd: number; profitUsd: number }[]
  returns: { returned: number; delivered: number; deliveryCostUsd: number }
  alerts: {
    lowStockThreshold: number
    lowStock: { productId: string; name: string; available: number }[]
    lateOrderDays: number
    lateOrders: { orderId: string; orderNumber: string; customerName?: string | null; orderedAt: string; days: number }[]
  }
  rate: Rate
}

export type Wealth = {
  totals: WealthTotals
  accounts: { id: string; name: string; usd: number; syp: number; valueUsd: number }[]
  stock: { productId: string; name: string; available: number; valueUsd: number; inTransit: number; inTransitValueUsd: number }[]
  incoming: { invoiceId: string; invoiceNumber: string; invoiceDate: string; supplier?: string | null; units: number; valueUsd: number }[]
  advances: { personId: string; name: string; usd: number; syp: number; valueUsd: number }[]
  rate: Rate
}

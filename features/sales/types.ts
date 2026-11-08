// Mirrors the backend sales DTOs (com.techhouse.sales.web.dto).
// The backend omits null fields (Jackson NON_NULL), so nullable fields are optional here.

export type Currency = "USD" | "SYP"

/** PENDING: on the way. Then one final step: DELIVERED, RETURNED (not received) or VOIDED (entered by mistake). */
export type OrderStatus = "PENDING" | "DELIVERED" | "RETURNED" | "VOIDED"

export type Ref = { id: string; name: string }

/** USD at the order's fixed rate. Pending: expected profit. Returned: minus the delivery cost. Voided: zero. */
export type OrderMoney = { revenueUsd: number; cogsUsd: number; deliveryCostUsd: number; profitUsd: number }

export type OrderSummary = {
  id: string
  orderNumber: string
  status: OrderStatus
  customerName?: string | null
  customerPhone?: string | null
  currency: Currency
  customerTotal: number
  itemCount: number
  deliveryCompany?: Ref | null
  money: OrderMoney
  orderedAt: string
}

export type OrderItem = {
  id: string
  product: { id: string; name: string; sku?: string | null }
  quantity: number
  unitPrice: number
  lineTotal: number
  /** Landed cost (USD) of the units taken, FIFO. */
  costUsd: number
}

export type OrderHistory = { fromStatus?: OrderStatus | null; toStatus: OrderStatus; note?: string | null; at: string }

export type OrderDetail = {
  id: string
  orderNumber: string
  status: OrderStatus
  customer: { name?: string | null; phone?: string | null; address?: string | null }
  currency: Currency
  /** Sell rate (SYP per USD) fixed when the order was entered. */
  exchangeRate?: number | null
  items: OrderItem[]
  itemsTotal: number
  deliveryFeeCharged: number
  customerTotal: number
  deliveryCost: number
  deliveryCostCurrency?: Currency | null
  deliveryCompany?: Ref | null
  money: OrderMoney
  notes?: string | null
  orderedAt: string
  deliveredAt?: string | null
  returnedAt?: string | null
  voidedAt?: string | null
  history: OrderHistory[]
  version: number
}

export type OrderInput = {
  customerName: string
  customerPhone: string | null
  customerAddress: string | null
  currency: Currency
  items: { productId: string; quantity: number; unitPrice: number }[]
  deliveryFeeCharged: number
  deliveryCost: number
  deliveryCostCurrency: Currency
  deliveryCompanyId: string | null
  notes: string | null
}

export type OrderListParams = { status: OrderStatus | null; search: string; page: number; size: number }

/** "deliver" → DELIVERED, "return" → RETURNED, "void" → VOIDED. */
export type OrderTransition = "deliver" | "return" | "void"

export type DeliveryCompany = {
  id: string
  name: string
  contactInfo?: string | null
  active: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export type DeliveryCompanyInput = { name: string; contactInfo: string | null; active: boolean; version?: number }

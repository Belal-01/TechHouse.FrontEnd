// Mirrors com.techhouse.inventory.web.dto.StockItem.
export type StockItem = {
  productId: string
  name: string
  sku?: string | null
  sellingPrice: number
  active: boolean
  /** Units in the warehouse, ready to sell. */
  available: number
  valueUsd: number
  /** Units out with customers on pending orders. */
  inTransit: number
  inTransitValueUsd: number
  incoming: number
  /** Bought at least once. */
  stocked: boolean
  /** Stocked, for sale, and below the low-stock threshold. */
  low: boolean
}

export type ProductStock = {
  summary: StockItem
  lowStockThreshold: number
  /** Oldest first: the order FIFO sells from. */
  lots: {
    id: string
    invoiceId: string
    invoiceNumber: string
    invoiceDate: string
    supplierName?: string | null
    qtyIn: number
    qtyLeft: number
    /** Landed cost per unit. */
    unitCost: number
    receivedAt: string
  }[]
  recentOrders: { orderId: string; orderNumber: string; status: "PENDING" | "DELIVERED" | "RETURNED" | "VOIDED"; quantity: number; unitCost?: number | null; orderedAt: string }[]
}

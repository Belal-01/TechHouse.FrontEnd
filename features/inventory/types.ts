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
}

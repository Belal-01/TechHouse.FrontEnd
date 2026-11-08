// Mirrors the backend procurement DTOs (com.techhouse.procurement.web.dto).
// The backend omits null fields (Jackson NON_NULL), so nullable fields are optional here.

export type Supplier = {
  id: string
  name: string
  contactInfo?: string | null
  notes?: string | null
  active: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export type SupplierInput = {
  name: string
  contactInfo: string | null
  notes: string | null
  active: boolean
  version?: number
}

export type SupplierListParams = {
  search: string
  active: boolean | null
}

/** INCOME: paid from the shop's cash. EXTERNAL_CAPITAL: the owner put in new money for it. */
export type PaidFrom = "INCOME" | "EXTERNAL_CAPITAL"

export type SupplierRef = { id: string; name: string }

export type InvoiceItem = {
  id: string
  product: { id: string; name: string; sku?: string | null }
  quantity: number
  unitPriceUsd: number
  /** This line's share of shipping + customs (whole line). */
  extraCostUsd: number
  /** Real cost of one unit once it arrived. */
  landedUnitCost: number
  lineTotalUsd: number
}

export type InvoiceDetail = {
  id: string
  invoiceNumber: string
  supplier?: SupplierRef | null
  invoiceDate: string
  shippingCostUsd: number
  customsCostUsd: number
  itemsTotalUsd: number
  totalUsd: number
  paidFrom: PaidFrom
  /** The box that paid. */
  account?: SupplierRef | null
  notes?: string | null
  hasAttachment: boolean
  items: InvoiceItem[]
  version: number
  createdAt: string
  /** Set when voided (entered by mistake). */
  voidedAt?: string | null
  voidNote?: string | null
  /** Can still be voided: not voided and none of its units sold or on the way. */
  voidable: boolean
}

export type InvoiceSummary = {
  id: string
  invoiceNumber: string
  supplier?: SupplierRef | null
  invoiceDate: string
  itemCount: number
  totalUsd: number
  paidFrom: PaidFrom
  hasAttachment: boolean
  voided: boolean
}

export type InvoiceInput = {
  supplierId: string | null
  invoiceDate: string
  shippingCostUsd: number
  customsCostUsd: number
  paidFrom: PaidFrom
  /** null = the default box. */
  accountId: string | null
  notes: string | null
  items: { productId: string; quantity: number; unitPriceUsd: number }[]
}

export type InvoiceListParams = {
  supplierId: string | null
  page: number
  size: number
}

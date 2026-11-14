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

export type SupplierRef = { id: string; name: string }

/** IN_TRANSIT: bought and paid, on its way, not sellable yet. RECEIVED: arrived, in stock. */
export type InvoiceStatus = "IN_TRANSIT" | "RECEIVED"
export type CostKind = "CHINA_SHIPPING" | "SEA_FREIGHT" | "CUSTOMS" | "OTHER"
/** ACCOUNT: a store box. OWNER / INVESTOR: that person's own money. EXTERNAL: outside money not assigned yet. */
export type PaymentSource = "ACCOUNT" | "OWNER" | "INVESTOR" | "EXTERNAL"
export type Currency = "USD" | "SYP"

export type InvoiceItem = {
  id: string
  product: { id: string; name: string; sku?: string | null }
  quantity: number
  unitPriceUsd: number
  /** This line's share of the costs (whole line). */
  extraCostUsd: number
  /** Real cost of one unit: price + its share of the costs (an estimate while on the way). */
  landedUnitCost: number
  lineTotalUsd: number
}

export type InvoiceCost = {
  id: string
  kind: CostKind
  description?: string | null
  amount: number
  currency: Currency
  exchangeRate?: number | null
  amountUsd: number
  /** Added after the goods arrived: spread over the units still in stock then. */
  afterReceipt: boolean
  createdAt: string
  removable: boolean
}

export type InvoicePayment = {
  id: string
  /** null: pays for the goods. */
  costId?: string | null
  source: PaymentSource
  account?: SupplierRef | null
  partner?: SupplierRef | null
  amount: number
  currency: Currency
  amountUsd: number
}

export type InvoiceFunding = { storeUsd: number; ownersUsd: number; investorsUsd: number; unassignedUsd: number }

export type InvoiceDetail = {
  id: string
  invoiceNumber: string
  supplier?: SupplierRef | null
  invoiceDate: string
  status: InvoiceStatus
  receivedAt?: string | null
  itemsTotalUsd: number
  costsTotalUsd: number
  totalUsd: number
  funding: InvoiceFunding
  notes?: string | null
  hasAttachment: boolean
  items: InvoiceItem[]
  costs: InvoiceCost[]
  payments: InvoicePayment[]
  /** Units still in stock (0 while on the way). */
  unitsInStock: number
  version: number
  createdAt: string
  voidedAt?: string | null
  voidNote?: string | null
  /** Can still be voided: not voided and none of its units sold or taken by an order. */
  voidable: boolean
}

export type InvoiceSummary = {
  id: string
  invoiceNumber: string
  supplier?: SupplierRef | null
  invoiceDate: string
  status: InvoiceStatus
  itemCount: number
  totalUsd: number
  hasAttachment: boolean
  voided: boolean
  /** Part of it was paid with outside money not attributed to a person yet. */
  unassigned: boolean
}

/** Who pays: a box (null id = the default box) or a person. */
export type PayerInput = { source: Exclude<PaymentSource, "EXTERNAL">; accountId: string | null; partnerId: string | null }

export type CostInput = PayerInput & { kind: CostKind; description: string | null; amount: number; currency: Currency }

export type InvoiceInput = {
  supplierId: string | null
  invoiceDate: string
  status: InvoiceStatus
  notes: string | null
  items: { productId: string; quantity: number; unitPriceUsd: number }[]
  costs: CostInput[]
  payments: (PayerInput & { amountUsd: number })[]
}

export type AssignInput = { parts: { source: "OWNER" | "INVESTOR"; partnerId: string; amount: number }[] }

export type InvoiceListParams = {
  supplierId: string | null
  status: InvoiceStatus | null
  page: number
  size: number
}

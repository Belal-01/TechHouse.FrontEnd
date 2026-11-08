// Mirrors the backend finance DTOs (com.techhouse.finance.web.dto).
// The backend omits null fields (Jackson NON_NULL), so nullable fields are optional here.

export type RateSource = "API" | "MANUAL"
/** PENDING_REVIEW: fetched, but more than 20% away from the rate in use, so it waits for approval. */
export type RateStatus = "ACTIVE" | "PENDING_REVIEW"

export type ExchangeRate = {
  id: string
  rateDate: string
  currencyPair: string
  buyRate: number
  /** Used to convert sales. */
  sellRate: number
  /** (buy + sell) / 2, for reference. */
  midRate: number
  source: RateSource
  status: RateStatus
  sourceUpdatedAt?: string | null
  updatedAt: string
}

export type CurrentRate = {
  current?: ExchangeRate | null
  pendingReview?: ExchangeRate | null
  /** The rate in use is not from today (or there is none). */
  stale: boolean
  today: string
  apiUsage: { configured: boolean; used: number; limit: number; providerRemaining?: number | null }
}

export type ManualRateInput = { buyRate: number; sellRate: number }

// ---- Boxes and the ledger --------------------------------------------------------------

export type Currency = "USD" | "SYP"

export type Ref = { id: string; name: string }

/** A place money is kept ("في يدي", "شام كاش"), with its two balances (may be negative). */
export type CashAccount = { id: string; name: string; isDefault: boolean; active: boolean; usd: number; syp: number; version: number }

export type MovementType =
  | "CAPITAL_IN"
  | "SALE_PAYMENT"
  | "EXCHANGE_IN"
  | "TRANSFER_IN"
  | "ADVANCE_RETURN"
  | "REFUND"
  | "PURCHASE_PAYMENT"
  | "EXPENSE"
  | "WITHDRAWAL_PERSONAL"
  | "EXCHANGE_OUT"
  | "TRANSFER_OUT"
  | "ADVANCE_OUT"
  | "ADJUSTMENT"

export type Movement = {
  id: string
  account: Ref
  currency: Currency
  type: MovementType
  /** Signed: + into the box, − out of it. */
  amount: number
  exchangeRate?: number | null
  /** What caused it, with a readable label (order / invoice number, expense, person). */
  reference?: { type: "ORDER" | "PURCHASE_INVOICE" | "EXPENSE" | "PERSON"; id: string; label?: string | null } | null
  group?: string | null
  note?: string | null
  createdAt: string
}

export type MovementListParams = { accountId: string | null; currency: Currency | null; page: number; size: number }

export type CapitalInput = { accountId: string; currency: Currency; amount: number; note: string | null }
export type TransferInput = { fromAccountId: string; toAccountId: string; currency: Currency; amount: number; note: string | null }
export type ExchangeInput = {
  fromAccountId: string
  fromCurrency: Currency
  fromAmount: number
  toAccountId: string
  toAmount: number
  note: string | null
}
export type AdjustmentInput = { accountId: string; currency: Currency; amount: number; note: string }

// ---- Expenses ---------------------------------------------------------------------------

/** system: used by the app itself (e.g. delivery fees); can be renamed but not removed. */
export type ExpenseCategory = { id: string; name: string; system: boolean; active: boolean; version: number }

export type Expense = {
  id: string
  expenseDate: string
  category: Ref
  description?: string | null
  amount: number
  currency: Currency
  exchangeRate?: number | null
  amountUsd: number
  /** Null when it was paid out of a staff advance. */
  account?: Ref | null
  /** Set for order delivery fees (voided together with their order). */
  orderId?: string | null
  paidBy?: Ref | null
  voidedAt?: string | null
  createdAt: string
}

export type ExpenseInput = {
  categoryId: string
  amount: number
  currency: Currency
  accountId: string
  expenseDate: string
  description: string | null
}

export type ExpenseListParams = { categoryId: string | null; from: string; to: string; page: number; size: number }

export type ExpenseSummary = {
  from: string
  to: string
  totalUsd: number
  categories: { category: Ref; amountUsd: number; count: number }[]
}

// ---- Advances ---------------------------------------------------------------------------

/** owedUsd / owedSyp: what the person still holds of the shop's money. */
export type Person = { id: string; name: string; phone?: string | null; active: boolean; owedUsd: number; owedSyp: number; version: number }

export type AdvanceEntry = {
  id: string
  kind: "WITHDRAWAL" | "RETURN" | "EXPENSE"
  currency: Currency
  /** Signed: + took money, − returned or spent. */
  amount: number
  account?: Ref | null
  expenseId?: string | null
  note?: string | null
  createdAt: string
}

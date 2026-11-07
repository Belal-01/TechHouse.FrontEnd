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

// Public, client-safe API of the finance feature.
export { ExchangeRateIndicator } from "./components/exchange-rate-indicator"
export { ExchangeRatesView } from "./components/exchange-rates-view"
// Used by other features to value SYP amounts (sales use the sell rate).
export { useCurrentRate } from "./api/exchange-rates"
export type { CurrentRate, ExchangeRate } from "./types"

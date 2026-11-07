// Single place for locale-aware formatting. Never format numbers, money, dates or names by hand.
// Arabic text with Latin digits ("nu-latn"), so figures match what users type into inputs.
const LOCALE = "ar-u-nu-latn"

const regionNames = new Intl.DisplayNames([LOCALE], { type: "region" })
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" })

/** "SY" → "سوريا", "LY" → "ليبيا". Falls back to the code if unknown. */
export function regionName(countryCode: string): string {
  try {
    return regionNames.of(countryCode.toUpperCase()) ?? countryCode
  } catch {
    return countryCode
  }
}

// "$800" rather than the Arabic locale's "800 US$"; render inside dir="ltr" so it stays in this order.
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** USD amount → "$1,234.5". Wrap the result in an element with dir="ltr". */
export function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

/** ISO timestamp or Date → numeric date, e.g. "2026/11/03" (avoids month names that differ between Syria and Libya). */
export function formatDate(value: string | Date): string {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value)
}

const unitCostFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

/** Per-unit cost with up to 4 decimals ("$33.3334"), where cents alone would hide the shipping share. dir="ltr". */
export function formatUnitCost(value: number): string {
  return unitCostFormatter.format(value)
}

const integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

/** Quantities and counts: "1,250". */
export function formatQuantity(value: number): string {
  return integerFormatter.format(value)
}

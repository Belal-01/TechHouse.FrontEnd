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
const wholeMoneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const centsMoneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** USD amount → "$1,234" or "$1,234.50" (cents shown in full when there are any). Wrap in dir="ltr". */
export function formatMoney(value: number): string {
  return Math.round(value * 100) % 100 === 0 ? wholeMoneyFormatter.format(value) : centsMoneyFormatter.format(value)
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

const sypFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

/** Syrian pounds without the unit: "14,487.5". Render in dir="ltr" and put "ل.س" beside it. */
export function formatSyp(value: number): string {
  return sypFormatter.format(value)
}

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" })

/** ISO timestamp → date and time, e.g. "2026/11/08، 10:00 ص". */
export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(typeof value === "string" ? new Date(value) : value)
}

const compactMoneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

/** Short USD for chart axes: "$1.2K". dir="ltr". */
export function formatMoneyCompact(value: number): string {
  return compactMoneyFormatter.format(value)
}

// Latin locale on purpose: the Arabic one inserts direction marks that scramble "1/11" inside a left-to-right chart.
const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "numeric" })
// Syrian month names ("تشرين الثاني"), the ones the shop's customers use.
const monthYearFormatter = new Intl.DateTimeFormat("ar-SY-u-nu-latn", { month: "long", year: "numeric" })

/** "8/11" for chart days; "تشرين الثاني 2026" style for months. */
export function formatDayMonth(value: string | Date): string {
  return dayMonthFormatter.format(typeof value === "string" ? new Date(`${value}T00:00:00`) : value)
}

export function formatMonthYear(value: string | Date): string {
  return monthYearFormatter.format(typeof value === "string" ? new Date(`${value}T00:00:00`) : value)
}

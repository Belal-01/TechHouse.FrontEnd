// The two currencies the shop works with. Labels are shared by every currency picker.
export type Currency = "USD" | "SYP"

export const CURRENCY_LABELS: Record<Currency, string> = { USD: "دولار", SYP: "ليرة سورية" }

export const CURRENCY_ITEMS = (Object.keys(CURRENCY_LABELS) as Currency[]).map((value) => ({
  value,
  label: CURRENCY_LABELS[value],
}))

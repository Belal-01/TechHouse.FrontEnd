import type { OrderFormValues } from "../schemas/order.schema"
import type { OrderInput } from "../types"

export const emptyOrderForm: OrderFormValues = {
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  currency: "USD",
  deliveryCompanyId: "",
  deliveryCost: "",
  deliveryCostCurrency: "SYP",
  deliveryFeeCharged: "",
  notes: "",
  items: [],
}

export const CURRENCY_LABELS = { USD: "دولار", SYP: "ليرة سورية" } as const

const blankToNull = (value: string) => (value.trim() === "" ? null : value.trim())

/** Form values → API request. */
export function toOrderInput(form: OrderFormValues): OrderInput {
  return {
    customerName: form.customerName.trim(),
    customerPhone: blankToNull(form.customerPhone),
    customerAddress: blankToNull(form.customerAddress),
    currency: form.currency,
    items: form.items.map((line) => ({
      productId: line.productId,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
    })),
    deliveryFeeCharged: Number(form.deliveryFeeCharged || 0),
    deliveryCost: Number(form.deliveryCost || 0),
    deliveryCostCurrency: form.deliveryCostCurrency,
    deliveryCompanyId: form.deliveryCompanyId || null,
    notes: blankToNull(form.notes),
  }
}

/** A product's USD list price shown in the order currency: SYP at the sell rate, rounded to whole pounds. */
export function defaultUnitPrice(sellingPriceUsd: number, currency: "USD" | "SYP", sellRate: number | null): string {
  if (currency === "USD") return String(sellingPriceUsd)
  return sellRate ? String(Math.round(sellingPriceUsd * sellRate)) : ""
}

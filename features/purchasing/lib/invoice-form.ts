import type { InvoiceInput, PaidFrom } from "../types"
import type { InvoiceFormValues } from "../schemas/invoice.schema"

export const PAID_FROM_LABELS: Record<PaidFrom, string> = {
  INCOME: "من صندوق المتجر",
  EXTERNAL_CAPITAL: "رأس مال جديد",
}

export function emptyInvoiceForm(today: string): InvoiceFormValues {
  return {
    supplierId: "",
    invoiceDate: today,
    paidFrom: "INCOME",
    accountId: "",
    shippingCostUsd: "",
    customsCostUsd: "",
    notes: "",
    items: [],
  }
}

/** shipping + customs as one amount string for the cost preview. */
export function extraCost(form: Pick<InvoiceFormValues, "shippingCostUsd" | "customsCostUsd">): string {
  const shipping = Number(form.shippingCostUsd || 0)
  const customs = Number(form.customsCostUsd || 0)
  return Number.isFinite(shipping + customs) ? (shipping + customs).toFixed(4) : "0"
}

/** Form values → API request. */
export function toInvoiceInput(form: InvoiceFormValues): InvoiceInput {
  return {
    supplierId: form.supplierId || null,
    invoiceDate: form.invoiceDate,
    paidFrom: form.paidFrom,
    accountId: form.accountId || null,
    shippingCostUsd: Number(form.shippingCostUsd || 0),
    customsCostUsd: Number(form.customsCostUsd || 0),
    notes: form.notes.trim() === "" ? null : form.notes.trim(),
    items: form.items.map((line) => ({
      productId: line.productId,
      quantity: Number(line.quantity),
      unitPriceUsd: Number(line.unitPriceUsd),
    })),
  }
}

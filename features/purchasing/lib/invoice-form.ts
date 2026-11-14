import type { CostInput, CostKind, Currency, InvoiceInput, InvoiceStatus, PayerInput, PaymentSource } from "../types"
import { goodsTotalUnits, type CostLineValues, type InvoiceFormValues } from "../schemas/invoice.schema"

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  IN_TRANSIT: "في الطريق",
  RECEIVED: "وصلت",
}

export const COST_KIND_LABELS: Record<CostKind, string> = {
  CHINA_SHIPPING: "شحن داخل الصين",
  SEA_FREIGHT: "شحن بحري",
  CUSTOMS: "جمارك",
  OTHER: "أخرى",
}

export const SOURCE_LABELS: Record<PaymentSource, string> = {
  ACCOUNT: "صندوق المتجر",
  OWNER: "صاحب شركة",
  INVESTOR: "مستثمر",
  EXTERNAL: "رأس مال خارجي غير محدد",
}

/** The default box: an empty id means the store's default box. */
export const DEFAULT_PAYER = "ACCOUNT:"

export function payerValue(source: Exclude<PaymentSource, "EXTERNAL">, id: string | null): string {
  return `${source}:${id ?? ""}`
}

export function parsePayer(value: string): PayerInput {
  const [source, id = ""] = value.split(":") as [PayerInput["source"], string?]
  return source === "ACCOUNT"
    ? { source, accountId: id || null, partnerId: null }
    : { source, accountId: null, partnerId: id || null }
}

export function emptyCost(kind: CostKind): CostLineValues {
  return { kind, description: "", amount: "", currency: "USD", payer: DEFAULT_PAYER }
}

export function emptyInvoiceForm(today: string): InvoiceFormValues {
  return {
    supplierId: "",
    invoiceDate: today,
    status: "IN_TRANSIT",
    notes: "",
    items: [],
    costs: [emptyCost("CHINA_SHIPPING")],
    payments: [{ payer: DEFAULT_PAYER, amount: "" }],
  }
}

export function toCostInput(cost: CostLineValues): CostInput {
  return {
    ...parsePayer(cost.payer),
    kind: cost.kind,
    description: cost.description.trim() || null,
    amount: Number(cost.amount),
    currency: cost.currency as Currency,
  }
}

/** A cost line's value in dollars for previews (SYP at the sell rate); 0 while invalid or without a rate. */
export function costUsd(cost: Pick<CostLineValues, "amount" | "currency">, sellRate: number | null): number {
  const amount = Number(cost.amount)
  if (!Number.isFinite(amount) || amount <= 0) return 0
  if (cost.currency === "USD") return amount
  return sellRate ? amount / sellRate : 0
}

/** Form values → API request. A single goods payment pays the whole goods total. */
export function toInvoiceInput(form: InvoiceFormValues): InvoiceInput {
  const total = Number(goodsTotalUnits(form.items) ?? BigInt(0)) / 10_000
  return {
    supplierId: form.supplierId || null,
    invoiceDate: form.invoiceDate,
    status: form.status,
    notes: form.notes.trim() === "" ? null : form.notes.trim(),
    items: form.items.map((line) => ({
      productId: line.productId,
      quantity: Number(line.quantity),
      unitPriceUsd: Number(line.unitPriceUsd),
    })),
    costs: form.costs.map(toCostInput),
    payments: form.payments.map((payment) => ({
      ...parsePayer(payment.payer),
      amountUsd: form.payments.length === 1 ? total : Number(payment.amount),
    })),
  }
}

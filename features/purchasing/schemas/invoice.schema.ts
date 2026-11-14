import { z } from "zod"
import { toUnits } from "../lib/landed-cost"

const AMOUNT_PATTERN = /^\d{1,15}(\.\d{1,4})?$/
export const MAX_INVOICE_LINES = 200
export const MAX_INVOICE_COSTS = 50
export const MAX_GOODS_PAYMENTS = 20

const requiredAmount = z
  .string()
  .trim()
  .min(1, { error: "أدخل المبلغ." })
  .regex(AMOUNT_PATTERN, { error: "مبلغ غير صالح." })
  .refine((value) => Number(value) > 0, { error: "المبلغ يجب أن يكون أكبر من صفر." })

/** "ACCOUNT:" (default box), "ACCOUNT:<id>", "OWNER:<id>" or "INVESTOR:<id>". */
export const payerSchema = z.string().regex(/^(ACCOUNT:.*|OWNER:.+|INVESTOR:.+)$/, { error: "اختر من دفع." })

export const invoiceLineSchema = z.object({
  productId: z.string().min(1, { error: "اختر منتجاً." }),
  /** Shown on the line; not sent to the server. */
  productName: z.string(),
  productSku: z.string(),
  quantity: z
    .string()
    .trim()
    .min(1, { error: "أدخل الكمية." })
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 1_000_000, {
      error: "كمية بين 1 و1,000,000.",
    }),
  unitPriceUsd: z
    .string()
    .trim()
    .min(1, { error: "أدخل السعر." })
    .regex(AMOUNT_PATTERN, { error: "سعر غير صالح." })
    .refine((value) => Number(value) > 0, { error: "السعر يجب أن يكون أكبر من صفر." }),
})

export const costLineSchema = z
  .object({
    kind: z.enum(["CHINA_SHIPPING", "SEA_FREIGHT", "CUSTOMS", "OTHER"]),
    description: z.string().trim().max(255, { error: "255 حرفاً كحد أقصى." }),
    amount: requiredAmount,
    currency: z.enum(["USD", "SYP"]),
    payer: payerSchema,
  })
  .refine((cost) => cost.kind !== "OTHER" || cost.description !== "", {
    error: "اكتب ما هي هذه التكلفة.",
    path: ["description"],
  })

/** With one payment it covers the whole goods total, so its amount is not asked. */
export const paymentLineSchema = z.object({ payer: payerSchema, amount: z.string().trim() })

/** Sum of the goods in 1/10,000 dollar units, or null while a line is invalid. */
export function goodsTotalUnits(items: { quantity: string; unitPriceUsd: string }[]): bigint | null {
  let total = BigInt(0)
  for (const line of items) {
    const price = toUnits(line.unitPriceUsd)
    if (price === null || !/^\d+$/.test(line.quantity.trim())) return null
    total += price * BigInt(line.quantity.trim())
  }
  return total
}

export const invoiceFormSchema = z
  .object({
    supplierId: z.string(),
    invoiceDate: z.iso.date({ error: "أدخل تاريخ الفاتورة." }),
    status: z.enum(["IN_TRANSIT", "RECEIVED"]),
    notes: z.string().max(5000, { error: "5000 حرف كحد أقصى." }),
    items: z
      .array(invoiceLineSchema)
      .min(1, { error: "أضف منتجاً واحداً على الأقل." })
      .max(MAX_INVOICE_LINES, { error: `${MAX_INVOICE_LINES} بنداً كحد أقصى.` }),
    costs: z.array(costLineSchema).max(MAX_INVOICE_COSTS, { error: `${MAX_INVOICE_COSTS} تكلفة كحد أقصى.` }),
    payments: z.array(paymentLineSchema).min(1).max(MAX_GOODS_PAYMENTS),
  })
  .superRefine((form, ctx) => {
    if (form.payments.length < 2) return
    let sum = BigInt(0)
    form.payments.forEach((payment, index) => {
      const units = toUnits(payment.amount)
      if (units === null || units === BigInt(0)) {
        ctx.addIssue({ code: "custom", path: ["payments", index, "amount"], message: "أدخل المبلغ." })
      } else {
        sum += units
      }
    })
    const total = goodsTotalUnits(form.items)
    if (total !== null && sum !== total) {
      ctx.addIssue({ code: "custom", path: ["payments"], message: "مجموع الدفعات يجب أن يساوي قيمة البضاعة." })
    }
  })

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
export type InvoiceLineValues = z.infer<typeof invoiceLineSchema>
export type CostLineValues = z.infer<typeof costLineSchema>

/** Dialogs on the invoice page: arrival costs, or one late cost. */
export const costsFormSchema = z.object({ costs: z.array(costLineSchema).max(MAX_INVOICE_COSTS) })
export type CostsFormValues = z.infer<typeof costsFormSchema>

/** Splitting an unassigned payment between people; the parts must add up to `total` (its currency, 4 decimals). */
export function assignFormSchema(total: number) {
  return z
    .object({
      parts: z
        .array(z.object({ partner: z.string().regex(/^(OWNER|INVESTOR):.+$/, { error: "اختر الشخص." }), amount: requiredAmount }))
        .min(1)
        .max(10),
    })
    .superRefine((form, ctx) => {
      const sum = form.parts.reduce((acc, part) => acc + (toUnits(part.amount) ?? BigInt(0)), BigInt(0))
      if (sum !== toUnits(total.toFixed(4))) {
        ctx.addIssue({ code: "custom", path: ["parts"], message: "مجموع الأجزاء يجب أن يساوي مبلغ الدفعة." })
      }
    })
}
export type AssignFormValues = z.infer<ReturnType<typeof assignFormSchema>>

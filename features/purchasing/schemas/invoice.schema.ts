import { z } from "zod"

const AMOUNT_PATTERN = /^\d{1,15}(\.\d{1,4})?$/
export const MAX_INVOICE_LINES = 200

const optionalAmount = z
  .string()
  .trim()
  .refine((value) => value === "" || AMOUNT_PATTERN.test(value), { error: "مبلغ غير صالح." })

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

export const invoiceFormSchema = z.object({
  supplierId: z.string(),
  invoiceDate: z.iso.date({ error: "أدخل تاريخ الفاتورة." }),
  paidFrom: z.enum(["INCOME", "EXTERNAL_CAPITAL"]),
  shippingCostUsd: optionalAmount,
  customsCostUsd: optionalAmount,
  notes: z.string().max(5000, { error: "5000 حرف كحد أقصى." }),
  items: z
    .array(invoiceLineSchema)
    .min(1, { error: "أضف منتجاً واحداً على الأقل." })
    .max(MAX_INVOICE_LINES, { error: `${MAX_INVOICE_LINES} بنداً كحد أقصى.` }),
})

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
export type InvoiceLineValues = z.infer<typeof invoiceLineSchema>

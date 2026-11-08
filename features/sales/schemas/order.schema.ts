import { z } from "zod"

const AMOUNT_PATTERN = /^\d{1,13}(\.\d{1,4})?$/
export const MAX_ORDER_LINES = 100

const optionalAmount = z
  .string()
  .trim()
  .refine((value) => value === "" || AMOUNT_PATTERN.test(value), { error: "مبلغ غير صالح." })

export const orderLineSchema = z.object({
  productId: z.string().min(1, { error: "اختر منتجاً." }),
  /** Shown on the line; not sent. */
  productName: z.string(),
  productSku: z.string(),
  /** Units in stock when the product was picked, for the hint and the client check. */
  available: z.number(),
  quantity: z
    .string()
    .trim()
    .min(1, { error: "أدخل الكمية." })
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, { error: "كمية غير صالحة." }),
  unitPrice: z
    .string()
    .trim()
    .min(1, { error: "أدخل السعر." })
    .regex(AMOUNT_PATTERN, { error: "سعر غير صالح." })
    .refine((value) => Number(value) > 0, { error: "السعر يجب أن يكون أكبر من صفر." }),
})

export const orderFormSchema = z
  .object({
    customerName: z.string().trim().min(1, { error: "أدخل اسم الزبون." }).max(255, { error: "الاسم طويل جداً." }),
    customerPhone: z
      .string()
      .trim()
      .max(50, { error: "50 حرفاً كحد أقصى." })
      .regex(/^[0-9+\s-]*$/, { error: "أرقام فقط." }),
    customerAddress: z.string().max(2000, { error: "2000 حرف كحد أقصى." }),
    currency: z.enum(["USD", "SYP"]),
    deliveryCompanyId: z.string(),
    deliveryCost: optionalAmount,
    deliveryCostCurrency: z.enum(["USD", "SYP"]),
    deliveryFeeCharged: optionalAmount,
    notes: z.string().max(5000, { error: "5000 حرف كحد أقصى." }),
    items: z
      .array(orderLineSchema)
      .min(1, { error: "أضف منتجاً واحداً على الأقل." })
      .max(MAX_ORDER_LINES, { error: `${MAX_ORDER_LINES} بنداً كحد أقصى.` }),
  })
  .superRefine((form, ctx) => {
    // Same product on several lines draws from the same stock.
    const wanted = new Map<string, number>()
    form.items.forEach((line) => wanted.set(line.productId, (wanted.get(line.productId) ?? 0) + Number(line.quantity || 0)))
    form.items.forEach((line, index) => {
      if ((wanted.get(line.productId) ?? 0) > line.available) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "quantity"],
          message: `المتوفر ${line.available} فقط.`,
        })
      }
    })
  })

export type OrderFormValues = z.infer<typeof orderFormSchema>
export type OrderLineValues = z.infer<typeof orderLineSchema>

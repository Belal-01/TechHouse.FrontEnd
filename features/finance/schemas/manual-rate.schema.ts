import { z } from "zod"

const RATE_PATTERN = /^\d{1,9}(\.\d{1,4})?$/

const rate = z
  .string()
  .trim()
  .min(1, { error: "أدخل السعر." })
  .regex(RATE_PATTERN, { error: "رقم غير صالح." })
  .refine((value) => Number(value) > 0, { error: "يجب أن يكون أكبر من صفر." })

export const manualRateSchema = z
  .object({ buyRate: rate, sellRate: rate })
  .refine((form) => Number(form.sellRate) >= Number(form.buyRate), {
    path: ["sellRate"],
    error: "سعر المبيع لا يمكن أن يكون أقل من سعر الشراء.",
  })

export type ManualRateFormValues = z.infer<typeof manualRateSchema>

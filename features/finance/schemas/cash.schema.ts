import { z } from "zod"

const AMOUNT_PATTERN = /^\d{1,13}(\.\d{1,4})?$/
const currency = z.enum(["USD", "SYP"])
const account = z.string().min(1, { error: "اختر الصندوق." })
const note = z.string().max(1000, { error: "1000 حرف كحد أقصى." })

export const amount = z
  .string()
  .trim()
  .min(1, { error: "أدخل المبلغ." })
  .regex(AMOUNT_PATTERN, { error: "مبلغ غير صالح." })
  .refine((value) => Number(value) > 0, { error: "المبلغ يجب أن يكون أكبر من صفر." })

/** Capital in, advance withdraw / return: one box, one currency, one amount. */
export const boxAmountSchema = z.object({ accountId: account, currency, amount, note })
export type BoxAmountValues = z.infer<typeof boxAmountSchema>

export const transferSchema = z
  .object({ fromAccountId: account, toAccountId: account, currency, amount, note })
  .refine((v) => v.fromAccountId !== v.toAccountId, { path: ["toAccountId"], error: "اختر صندوقاً مختلفاً." })
export type TransferValues = z.infer<typeof transferSchema>

export const exchangeSchema = z.object({
  fromAccountId: account,
  fromCurrency: currency,
  fromAmount: amount,
  toAccountId: account,
  toAmount: amount,
  note,
})
export type ExchangeValues = z.infer<typeof exchangeSchema>

/** Adjustment: the direction is chosen separately, the amount stays positive. */
export const adjustmentSchema = z.object({
  accountId: account,
  currency,
  direction: z.enum(["in", "out"]),
  amount,
  note: z.string().trim().min(1, { error: "اكتب سبب التسوية." }).max(1000, { error: "1000 حرف كحد أقصى." }),
})
export type AdjustmentValues = z.infer<typeof adjustmentSchema>

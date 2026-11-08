import { z } from "zod"
import { amount } from "./cash.schema"

export const personSchema = z.object({
  name: z.string().trim().min(1, { error: "أدخل الاسم." }).max(255, { error: "الاسم طويل جداً." }),
  phone: z
    .string()
    .trim()
    .max(50, { error: "50 حرفاً كحد أقصى." })
    .regex(/^[0-9+\s-]*$/, { error: "أرقام فقط." }),
  active: z.boolean(),
})
export type PersonFormValues = z.infer<typeof personSchema>

export const spendSchema = z.object({
  currency: z.enum(["USD", "SYP"]),
  amount,
  categoryId: z.string().min(1, { error: "اختر الفئة." }),
  expenseDate: z.iso.date({ error: "أدخل التاريخ." }),
  description: z.string().max(2000, { error: "2000 حرف كحد أقصى." }),
})
export type SpendFormValues = z.infer<typeof spendSchema>

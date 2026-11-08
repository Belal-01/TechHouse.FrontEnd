import { z } from "zod"
import { amount } from "./cash.schema"

export const expenseSchema = z.object({
  categoryId: z.string().min(1, { error: "اختر الفئة." }),
  amount,
  currency: z.enum(["USD", "SYP"]),
  accountId: z.string().min(1, { error: "اختر الصندوق." }),
  expenseDate: z.iso.date({ error: "أدخل التاريخ." }),
  description: z.string().max(2000, { error: "2000 حرف كحد أقصى." }),
})
export type ExpenseFormValues = z.infer<typeof expenseSchema>

export const categorySchema = z.object({
  name: z.string().trim().min(1, { error: "أدخل اسم الفئة." }).max(100, { error: "100 حرف كحد أقصى." }),
  active: z.boolean(),
})
export type CategoryFormValues = z.infer<typeof categorySchema>

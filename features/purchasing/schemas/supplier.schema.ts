import { z } from "zod"

export const supplierSchema = z.object({
  name: z.string().trim().min(1, { error: "أدخل اسم المورد." }).max(255, { error: "الاسم طويل جداً (255 حرفاً كحد أقصى)." }),
  contactInfo: z.string().max(2000, { error: "2000 حرف كحد أقصى." }),
  notes: z.string().max(5000, { error: "5000 حرف كحد أقصى." }),
  active: z.boolean(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

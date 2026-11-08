import { z } from "zod"

export const deliveryCompanySchema = z.object({
  name: z.string().trim().min(1, { error: "أدخل اسم الشركة." }).max(255, { error: "الاسم طويل جداً." }),
  contactInfo: z.string().max(2000, { error: "2000 حرف كحد أقصى." }),
  active: z.boolean(),
})

export type DeliveryCompanyFormValues = z.infer<typeof deliveryCompanySchema>

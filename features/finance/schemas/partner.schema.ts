import { z } from "zod"

export const partnerSchema = z.object({
  name: z.string().trim().min(1, { error: "أدخل الاسم." }).max(255, { error: "الاسم طويل جداً." }),
  kind: z.enum(["OWNER", "INVESTOR"]),
  profitPercent: z
    .string()
    .trim()
    .min(1, { error: "أدخل النسبة." })
    .refine((v) => /^\d{1,3}(\.\d{1,2})?$/.test(v) && Number(v) <= 100, { error: "نسبة بين 0 و100." }),
  phone: z
    .string()
    .trim()
    .max(50, { error: "50 حرفاً كحد أقصى." })
    .regex(/^[0-9+\s-]*$/, { error: "أرقام فقط." }),
  notes: z.string().max(2000, { error: "2000 حرف كحد أقصى." }),
  active: z.boolean(),
})
export type PartnerFormValues = z.infer<typeof partnerSchema>

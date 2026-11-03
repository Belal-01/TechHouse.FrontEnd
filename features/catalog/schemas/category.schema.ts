import { z } from "zod"

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "أدخل اسم التصنيف." })
    .max(255, { error: "الاسم طويل جداً (255 حرفاً كحد أقصى)." }),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

import { z } from "zod"

const PRICE_PATTERN = /^\d{1,15}(\.\d{1,4})?$/
const BARCODE_PATTERN = /^[0-9A-Za-z-]*$/

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, { error: "أدخل اسم المنتج." }).max(255, { error: "الاسم طويل جداً." }),
    description: z.string().max(5000, { error: "الوصف طويل جداً (5000 حرف كحد أقصى)." }),
    categoryId: z.string(),
    sellingPrice: z
      .string()
      .trim()
      .min(1, { error: "أدخل السعر." })
      .regex(PRICE_PATTERN, { error: "سعر غير صالح." })
      .refine((value) => Number(value) > 0, { error: "السعر يجب أن يكون أكبر من صفر." }),
    sku: z.string().trim().max(50, { error: "50 حرفاً كحد أقصى." }),
    barcode: z
      .string()
      .trim()
      .max(64, { error: "64 حرفاً كحد أقصى." })
      .regex(BARCODE_PATTERN, { error: "أرقام وحروف إنجليزية وشرطة فقط." }),
    warrantyMonths: z
      .string()
      .trim()
      .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 120), {
        error: "أدخل عدد أشهر بين 0 و120.",
      }),
    active: z.boolean(),
    specifications: z.array(
      z.object({
        key: z.string().trim().max(100, { error: "100 حرف كحد أقصى." }),
        value: z.string().trim().max(500, { error: "500 حرف كحد أقصى." }),
      }),
    ),
    version: z.number().optional(),
  })
  .superRefine((form, ctx) => {
    form.specifications.forEach((spec, index) => {
      if (!spec.key.trim() && spec.value.trim()) {
        ctx.addIssue({ code: "custom", path: ["specifications", index, "key"], message: "أدخل اسم المواصفة." })
      }
    })
  })

export type ProductFormValues = z.infer<typeof productFormSchema>

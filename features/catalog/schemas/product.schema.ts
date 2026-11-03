import { z } from "zod"

export const MAX_OPTIONS = 3

const PRICE_PATTERN = /^\d{1,15}(\.\d{1,4})?$/
const BARCODE_PATTERN = /^[0-9A-Za-z-]*$/

export const variantFormSchema = z.object({
  /** Server id; absent for variants not saved yet. */
  id: z.string().optional(),
  optionValues: z.array(z.string()),
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
  imageId: z.string().nullable(),
  active: z.boolean(),
})

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, { error: "أدخل اسم المنتج." }).max(255, { error: "الاسم طويل جداً." }),
    description: z.string().max(5000, { error: "الوصف طويل جداً (5000 حرف كحد أقصى)." }),
    categoryId: z.string(),
    warrantyMonths: z
      .string()
      .trim()
      .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 120), {
        error: "أدخل عدد أشهر بين 0 و120.",
      }),
    active: z.boolean(),
    hasVariants: z.boolean(),
    options: z
      .array(
        z.object({
          /** Client-only key, so variants keep their data when options are added or removed. */
          key: z.string(),
          name: z.string().trim().min(1, { error: "أدخل اسم الخيار." }).max(50, { error: "50 حرفاً كحد أقصى." }),
          values: z.array(z.string()).min(1, { error: "أضف قيمة واحدة على الأقل." }),
        }),
      )
      .max(MAX_OPTIONS),
    variants: z.array(variantFormSchema).min(1, { error: "أضف قيم الخيارات لتظهر الأنواع." }),
    specifications: z.array(
      z.object({
        key: z.string().trim().max(100, { error: "100 حرف كحد أقصى." }),
        value: z.string().trim().max(500, { error: "500 حرف كحد أقصى." }),
      }),
    ),
    version: z.number().optional(),
  })
  .superRefine((form, ctx) => {
    if (form.hasVariants && form.options.length === 0) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "أضف خياراً واحداً على الأقل، مثل اللون." })
    }

    const seenOptions = new Set<string>()
    form.options.forEach((option, index) => {
      const name = option.name.trim().toLowerCase()
      if (name && seenOptions.has(name)) {
        ctx.addIssue({ code: "custom", path: ["options", index, "name"], message: "اسم الخيار مكرر." })
      }
      seenOptions.add(name)
    })

    const duplicates = (field: "sku" | "barcode", message: string) => {
      const seen = new Set<string>()
      form.variants.forEach((variant, index) => {
        const value = variant[field].trim()
        if (!value) return
        if (seen.has(value)) ctx.addIssue({ code: "custom", path: ["variants", index, field], message })
        seen.add(value)
      })
    }
    duplicates("sku", "الرمز مكرر في نوع آخر.")
    duplicates("barcode", "الباركود مكرر في نوع آخر.")

    form.specifications.forEach((spec, index) => {
      if (!spec.key.trim() && spec.value.trim()) {
        ctx.addIssue({ code: "custom", path: ["specifications", index, "key"], message: "أدخل اسم المواصفة." })
      }
    })
  })

export type ProductFormValues = z.infer<typeof productFormSchema>
export type VariantFormValues = z.infer<typeof variantFormSchema>
export type OptionFormValues = ProductFormValues["options"][number]

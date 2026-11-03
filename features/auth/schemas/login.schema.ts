import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "أدخل البريد الإلكتروني." })
    .max(255)
    .pipe(z.email({ error: "صيغة البريد الإلكتروني غير صحيحة." })),
  password: z
    .string()
    .min(1, { error: "أدخل كلمة المرور." })
    .max(128, { error: "كلمة المرور طويلة جداً." }),
})

export type LoginInput = z.infer<typeof loginSchema>

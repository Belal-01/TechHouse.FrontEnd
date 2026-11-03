"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/api/errors"
import { loginAction } from "../actions/login.action"
import { loginSchema, type LoginInput } from "../schemas/login.schema"

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    // Read at submit time instead of useSearchParams, so the form can prerender into the static shell.
    const next = new URLSearchParams(window.location.search).get("next")
    startTransition(async () => {
      const failure = await loginAction(values, next)
      if (!failure) return
      setServerError(errorMessage(failure.code))
      if (failure.code === "INVALID_CREDENTIALS") {
        setValue("password", "")
        setFocus("password")
      }
    })
  })

  return (
    // Inputs go readOnly (not disabled) while pending, so focus can return to them after an error.
    <form onSubmit={onSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-4">
      {serverError ? <Alert>{serverError}</Alert> : null}

      <FormField id="email" label="البريد الإلكتروني" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          dir="ltr"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="name@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          readOnly={isPending}
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="كلمة المرور" error={errors.password?.message}>
        {/* LTR wrapper so the toggle sits at the end of the LTR password text, using logical properties. */}
        <div className="relative" dir="ltr">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="pe-11"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            readOnly={isPending}
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute inset-e-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        </div>
      </FormField>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden />
            جارٍ تسجيل الدخول…
          </>
        ) : (
          "تسجيل الدخول"
        )}
      </Button>
    </form>
  )
}

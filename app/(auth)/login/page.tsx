import type { Metadata } from "next"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/features/auth"

export const metadata: Metadata = {
  title: "تسجيل الدخول",
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-8">
      <div className="absolute inset-e-4 top-4">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Logo className="h-28" priority />

        <section aria-labelledby="login-title" className="w-full rounded-md border bg-card p-6 sm:p-8">
          <header className="mb-6 flex flex-col gap-1">
            <h1 id="login-title" className="h2">
              تسجيل الدخول
            </h1>
            <p className="small text-muted-foreground">أدخل بيانات حسابك للوصول إلى لوحة الإدارة.</p>
          </header>
          <LoginForm />
        </section>

        <p className="small text-muted-foreground">البيت التقني · لوحة إدارة المخزون والمبيعات</p>
      </div>
    </main>
  )
}

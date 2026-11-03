"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { loginWithPassword } from "@/lib/auth/backend-auth"
import { STORE_COOKIE, writeSessionCookies } from "@/lib/auth/session-cookies"
import { loginSchema, type LoginInput } from "../schemas/login.schema"
import { safeRedirect } from "../lib/safe-redirect"

export type LoginFailure = { code: string }

/** Validates again on the server (never trust the client), sets httpOnly session cookies, then redirects. */
export async function loginAction(values: LoginInput, next?: string | null): Promise<LoginFailure> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) return { code: "VALIDATION_ERROR" }

  const result = await loginWithPassword(parsed.data.email, parsed.data.password)
  if (!result.ok) return { code: result.code }

  const jar = await cookies()
  writeSessionCookies(jar, result.auth, jar.get(STORE_COOKIE)?.value)
  redirect(safeRedirect(next))
}

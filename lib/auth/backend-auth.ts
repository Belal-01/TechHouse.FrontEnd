import { backendUrl } from "@/lib/env"
import type { ApiResponse, AuthResponse } from "@/lib/api/types"

const TIMEOUT_MS = 10_000

export type AuthResult =
  | { ok: true; auth: AuthResponse }
  | { ok: false; code: string }

async function postAuth(path: string, body: unknown): Promise<AuthResult> {
  let res: Response
  try {
    res = await fetch(`${backendUrl()}/api/v1/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    return { ok: false, code: "BACKEND_UNAVAILABLE" }
  }

  const payload = (await res.json().catch(() => null)) as ApiResponse<AuthResponse> | null
  if (!res.ok || !payload?.success || !payload.data) {
    return { ok: false, code: payload?.code ?? (res.status >= 500 ? "BACKEND_UNAVAILABLE" : "UNKNOWN_ERROR") }
  }
  return { ok: true, auth: payload.data }
}

export function loginWithPassword(email: string, password: string): Promise<AuthResult> {
  return postAuth("login", { email, password })
}

export function refreshSession(refreshToken: string): Promise<AuthResult> {
  return postAuth("refresh", { refreshToken })
}

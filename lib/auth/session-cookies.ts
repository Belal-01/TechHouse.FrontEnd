import { cookieSecure } from "@/lib/env"
import type { AuthResponse, StoreResponse, UserResponse } from "@/lib/api/types"

// Tokens live only in httpOnly cookies: browser JavaScript can never read them.
export const ACCESS_COOKIE = "th_at"
export const REFRESH_COOKIE = "th_rt"
export const SESSION_COOKIE = "th_session"
export const STORE_COOKIE = "th_store"

const ACCESS_SKEW_SECONDS = 30
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export type Session = {
  user: UserResponse
  stores: StoreResponse[]
  activeStore: StoreResponse | null
}

type CookieOptions = {
  httpOnly: boolean
  secure: boolean
  sameSite: "lax"
  path: string
  maxAge: number
}

// Satisfied by both NextResponse.cookies (proxy, route handlers) and cookies() (server actions).
export interface CookieWriter {
  set(name: string, value: string, options: CookieOptions): unknown
  delete(name: string): unknown
}

export interface CookieReader {
  get(name: string): { value: string } | undefined
}

export type CookieEntry = { name: string; value: string; options: CookieOptions }

function options(maxAge: number): CookieOptions {
  return { httpOnly: true, secure: cookieSecure(), sameSite: "lax", path: "/", maxAge }
}

function secondsUntilExpiry(jwt: string, fallback: number): number {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8")) as { exp?: number }
    if (typeof payload.exp === "number") return Math.max(payload.exp - Math.floor(Date.now() / 1000), 0)
  } catch {
    // Not decodable: fall back to the server-provided lifetime.
  }
  return fallback
}

/** Keeps the selected store if the user still has access to it, otherwise the first store. */
export function pickStoreId(stores: StoreResponse[], preferred?: string): string | undefined {
  return stores.find((s) => s.id === preferred)?.id ?? stores[0]?.id
}

/** All cookies that represent a session, computed once so proxy can apply them to both request and response. */
export function sessionCookieEntries(auth: AuthResponse, preferredStoreId?: string): CookieEntry[] {
  // Expire the access cookie slightly before the token so proxy refreshes before the backend rejects it.
  const accessMaxAge = Math.max(auth.expiresIn - ACCESS_SKEW_SECONDS, 1)
  const refreshMaxAge = secondsUntilExpiry(auth.refreshToken, 7 * 24 * 60 * 60)
  const session = Buffer.from(JSON.stringify({ user: auth.user, stores: auth.stores })).toString("base64url")
  const entries: CookieEntry[] = [
    { name: ACCESS_COOKIE, value: auth.accessToken, options: options(accessMaxAge) },
    { name: REFRESH_COOKIE, value: auth.refreshToken, options: options(refreshMaxAge) },
    { name: SESSION_COOKIE, value: session, options: options(refreshMaxAge) },
  ]
  const storeId = pickStoreId(auth.stores, preferredStoreId)
  if (storeId) entries.push({ name: STORE_COOKIE, value: storeId, options: options(ONE_YEAR_SECONDS) })
  return entries
}

export function writeSessionCookies(writer: CookieWriter, auth: AuthResponse, preferredStoreId?: string) {
  for (const { name, value, options } of sessionCookieEntries(auth, preferredStoreId)) {
    writer.set(name, value, options)
  }
}

export function clearSessionCookies(writer: CookieWriter) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) writer.delete(name)
}

// The session cookie only drives display; every request is still authorized by the backend via the JWT.
export function readSession(reader: CookieReader): Session | null {
  const raw = reader.get(SESSION_COOKIE)?.value
  if (!raw || !reader.get(REFRESH_COOKIE)) return null
  try {
    const { user, stores } = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      user: UserResponse
      stores: StoreResponse[]
    }
    const activeId = pickStoreId(stores, reader.get(STORE_COOKIE)?.value)
    return { user, stores, activeStore: stores.find((s) => s.id === activeId) ?? null }
  } catch {
    return null
  }
}

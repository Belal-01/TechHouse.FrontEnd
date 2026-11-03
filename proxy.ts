import { NextResponse, type NextRequest } from "next/server"
import { refreshSession } from "@/lib/auth/backend-auth"
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  STORE_COOKIE,
  clearSessionCookies,
  sessionCookieEntries,
  type CookieEntry,
} from "@/lib/auth/session-cookies"

const LOGIN_PATH = "/login"

/**
 * Route guard + silent token refresh.
 * - Access cookie expired but refresh cookie present → refresh once here, so every page,
 *   server component and BFF call in this request already sees fresh tokens.
 * - No valid session → /login (pages) or 401 JSON (API).
 * - Signed in and visiting /login → home.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isLoginPage = pathname === LOGIN_PATH
  const isApi = pathname.startsWith("/api/")

  let refreshed: CookieEntry[] | null = null
  let staleRefresh = false
  let authenticated = request.cookies.has(ACCESS_COOKIE)

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!authenticated && refreshToken) {
    const result = await refreshSession(refreshToken)
    if (result.ok) {
      refreshed = sessionCookieEntries(result.auth, request.cookies.get(STORE_COOKIE)?.value)
      // Make the new cookies visible to the rest of this request, not only to the browser.
      for (const { name, value } of refreshed) request.cookies.set(name, value)
      authenticated = true
    } else if (result.code !== "BACKEND_UNAVAILABLE") {
      staleRefresh = true
    }
  }

  let response: NextResponse
  if (!authenticated && !isLoginPage) {
    response = isApi
      ? NextResponse.json(
          { success: false, code: "UNAUTHORIZED", error: "Authentication required" },
          { status: 401 },
        )
      : NextResponse.redirect(loginUrl(request, pathname + search))
  } else if (authenticated && isLoginPage) {
    response = NextResponse.redirect(new URL("/", request.url))
  } else {
    response = NextResponse.next({ request: { headers: request.headers } })
  }

  if (refreshed) {
    for (const { name, value, options } of refreshed) response.cookies.set(name, value, options)
  } else if (staleRefresh) {
    clearSessionCookies(response.cookies)
  }
  return response
}

function loginUrl(request: NextRequest, next: string): URL {
  const url = new URL(LOGIN_PATH, request.url)
  if (next && next !== "/") url.searchParams.set("next", next)
  return url
}

export const config = {
  // Everything except Next internals and static files in /public.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
}

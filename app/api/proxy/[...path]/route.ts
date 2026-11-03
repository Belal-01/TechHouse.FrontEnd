import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { ACCESS_COOKIE, STORE_COOKIE } from "@/lib/auth/session-cookies"
import { backendUrl } from "@/lib/env"

// BFF: forwards browser calls to the backend's admin API, attaching the httpOnly token and active store.
// Only /api/v1/admin/** is reachable, and path segments are validated so nothing can escape that prefix.

const ALLOWED_ROOT = "admin"
const SAFE_SEGMENT = /^[A-Za-z0-9._~-]+$/
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])
const TIMEOUT_MS = 15_000
const PASSTHROUGH_HEADERS = [
  "content-type",
  "content-length",
  "cache-control",
  "content-disposition",
  "x-content-type-options",
] as const

type Context = { params: Promise<{ path: string[] }> }

function error(status: number, code: string, message: string) {
  return NextResponse.json({ success: false, code, error: message }, { status })
}

async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params
  const valid =
    path.length > 1 &&
    path[0] === ALLOWED_ROOT &&
    path.every((s) => SAFE_SEGMENT.test(s) && s !== "." && s !== "..")
  if (!valid) return error(404, "ENDPOINT_NOT_FOUND", "Unknown endpoint")

  if (UNSAFE_METHODS.has(request.method) && request.headers.get("x-requested-with") !== "fetch") {
    return error(403, "FORBIDDEN", "Missing client header")
  }

  const jar = await cookies()
  const token = jar.get(ACCESS_COOKIE)?.value
  if (!token) return error(401, "UNAUTHORIZED", "Authentication required")

  const headers = new Headers({ Authorization: `Bearer ${token}`, Accept: "application/json" })
  const storeId = jar.get(STORE_COOKIE)?.value
  if (storeId) headers.set("X-Store-Id", storeId)
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("Content-Type", contentType)

  let upstream: Response
  try {
    upstream = await fetch(`${backendUrl()}/api/v1/${path.join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body: UNSAFE_METHODS.has(request.method) ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    return error(502, "BACKEND_UNAVAILABLE", "Backend unavailable")
  }

  // Only headers the browser needs; everything else from the backend stays server-side.
  const responseHeaders = new Headers()
  for (const name of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  const response = new NextResponse(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })

  // Backend rejected a token we still held: drop it so the next navigation refreshes (or logs out)
  // instead of looping between /login and the dashboard.
  if (upstream.status === 401) response.cookies.delete(ACCESS_COOKIE)
  return response
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE }

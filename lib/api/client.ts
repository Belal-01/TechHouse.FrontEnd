import { ApiError } from "@/lib/api/errors"
import type { ApiResponse } from "@/lib/api/types"

// Browser-side client. Calls go to the Next.js BFF (/api/proxy), which attaches the httpOnly
// tokens and the active store; this code never sees a token.
const PROXY_BASE = "/api/proxy"

// Custom header forces a CORS preflight, so other sites can't forge state-changing requests.
const CSRF_HEADER = { "X-Requested-With": "fetch" }

function redirectToLogin() {
  if (typeof window === "undefined") return
  const next = window.location.pathname + window.location.search
  // Full navigation on purpose: it passes through proxy.ts (token refresh) and drops in-memory state.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?next=${encodeURIComponent(next)}`)
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  // FormData goes as multipart: the browser sets Content-Type with the boundary itself.
  const isForm = body instanceof FormData
  let res: Response
  try {
    res = await fetch(`${PROXY_BASE}${path}`, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...CSRF_HEADER,
        ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "NETWORK_ERROR")
  }

  if (res.status === 401) {
    redirectToLogin()
    throw new ApiError(401, "UNAUTHORIZED")
  }
  if (res.status === 204) return undefined as T

  const payload = (await res.json().catch(() => null)) as ApiResponse<T> | null
  if (!res.ok || !payload?.success) {
    throw new ApiError(res.status, payload?.code ?? "UNKNOWN_ERROR", payload?.error, payload?.fieldErrors)
  }
  return payload.data as T
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T = void>(path: string) => request<T>("DELETE", path),
  /** Multipart upload of a single file in the "file" field. */
  upload: <T>(path: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return request<T>("POST", path, form)
  },
}

/** URL of a backend binary (e.g. an image) through the same-origin BFF, so the session cookie applies. */
export function proxyUrl(path: string): string {
  return `${PROXY_BASE}${path}`
}

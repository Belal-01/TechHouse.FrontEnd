// Server-side runtime config. Read at request time (not inlined at build), so one image works in every environment.
// Deliberately not "server-only": proxy.ts imports it, and proxy isn't compiled under the react-server condition.

export function backendUrl(): string {
  return (process.env.BACKEND_URL ?? "http://localhost:8081").replace(/\/+$/, "")
}

// Secure cookies require HTTPS; set COOKIE_SECURE=false only for plain-HTTP local runs.
export function cookieSecure(): boolean {
  const flag = process.env.COOKIE_SECURE
  if (flag === "true") return true
  if (flag === "false") return false
  return process.env.NODE_ENV === "production"
}

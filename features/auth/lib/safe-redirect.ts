const DEFAULT_DESTINATION = "/"

/** Only same-site relative paths are allowed after login, to prevent open redirects (e.g. "//evil.com"). */
export function safeRedirect(target: string | null | undefined): string {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return DEFAULT_DESTINATION
  }
  if (target === "/login" || target.startsWith("/login?") || target.startsWith("/api/")) {
    return DEFAULT_DESTINATION
  }
  return target
}

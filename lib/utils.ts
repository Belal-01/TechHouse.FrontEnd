export { cn } from "cn"

/** Up to two initials from a display name; works for Arabic and Latin names. */
export function initials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase()
}

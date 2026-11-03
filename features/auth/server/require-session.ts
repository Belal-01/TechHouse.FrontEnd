import "server-only"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/server/session"
import type { Session } from "@/lib/auth/session-cookies"

/** Data Access Layer entry point: returns the session or sends the user to /login. */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

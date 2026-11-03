import "server-only"
import { cookies } from "next/headers"
import { readSession, type Session } from "@/lib/auth/session-cookies"

/** Reads the request's session. Request-time data: call it inside a <Suspense> boundary. */
export async function getSession(): Promise<Session | null> {
  return readSession(await cookies())
}

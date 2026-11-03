"use server"

import { cookies } from "next/headers"
import { clearSessionCookies } from "@/lib/auth/session-cookies"

// The backend has no token revocation yet, so logout only removes the cookies from this browser.
export async function logoutAction(): Promise<void> {
  clearSessionCookies(await cookies())
}

"use client"

import { useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { logoutAction } from "../actions/logout.action"

export function useLogout() {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const logout = () =>
    startTransition(async () => {
      await logoutAction()
      // Wipe cached data and any routes kept alive by <Activity>, so the next user starts clean.
      queryClient.clear()
      window.location.replace("/login")
    })

  return { logout, isPending }
}

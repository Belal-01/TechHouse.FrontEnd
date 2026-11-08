"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Dashboard, Wealth } from "../types"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  period: (from: string, to: string) => [...dashboardKeys.all, from, to] as const,
  wealth: () => [...dashboardKeys.all, "wealth"] as const,
}

/** Read-only; refreshed when the tab regains focus so it reflects what was just entered elsewhere. */
export function useDashboard(from: string, to: string) {
  return useQuery({
    queryKey: dashboardKeys.period(from, to),
    queryFn: () => api.get<Dashboard>(`/admin/dashboard?from=${from}&to=${to}`),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  })
}

export function useWealth() {
  return useQuery({ queryKey: dashboardKeys.wealth(), queryFn: () => api.get<Wealth>("/admin/dashboard/wealth") })
}

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { CurrentRate, ExchangeRate, ManualRateInput } from "../types"

const BASE = "/admin/finance/exchange-rates"

export const rateKeys = {
  all: ["finance", "exchange-rates"] as const,
  current: () => [...rateKeys.all, "current"] as const,
  history: (days: number) => [...rateKeys.all, "history", days] as const,
}

/** The rate shown in the header. Re-read every 5 minutes and on tab focus; the server refreshes it on a schedule. */
export function useCurrentRate() {
  return useQuery({
    queryKey: rateKeys.current(),
    queryFn: () => api.get<CurrentRate>(`${BASE}/current`),
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useRateHistory(days: number) {
  return useQuery({
    queryKey: rateKeys.history(days),
    queryFn: () => api.get<ExchangeRate[]>(`${BASE}?days=${days}`),
  })
}

function useInvalidateRates() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: rateKeys.all })
}

/** Calls the provider now (counts against the monthly quota). */
export function useRefreshRate() {
  const invalidate = useInvalidateRates()
  return useMutation({
    mutationFn: () => api.post<CurrentRate>(`${BASE}/refresh`),
    onSettled: invalidate,
  })
}

export function useSetManualRate() {
  const invalidate = useInvalidateRates()
  return useMutation({
    mutationFn: (input: ManualRateInput) => api.put<ExchangeRate>(`${BASE}/today`, input),
    onSuccess: invalidate,
  })
}

export function useApproveRate() {
  const invalidate = useInvalidateRates()
  return useMutation({
    mutationFn: (id: string) => api.post<ExchangeRate>(`${BASE}/${encodeURIComponent(id)}/approve`),
    onSettled: invalidate,
  })
}

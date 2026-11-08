"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { PageResponse } from "@/lib/api/types"
import { expenseKeys } from "./expenses"
import { peopleKeys } from "./people"
import type {
  AdjustmentInput,
  CapitalInput,
  CashAccount,
  ExchangeInput,
  Movement,
  MovementListParams,
  TransferInput,
} from "../types"

const BASE = "/admin/finance"

/** Every money screen depends on these; anything that moves cash invalidates `cashKeys.all`. */
export const cashKeys = {
  all: ["finance", "cash"] as const,
  accounts: () => [...cashKeys.all, "accounts"] as const,
  movements: (params: MovementListParams) => [...cashKeys.all, "movements", params] as const,
}

export function useCashAccounts() {
  return useQuery({ queryKey: cashKeys.accounts(), queryFn: () => api.get<CashAccount[]>(`${BASE}/accounts`) })
}

export function useMovements(params: MovementListParams) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.accountId) query.set("accountId", params.accountId)
  if (params.currency) query.set("currency", params.currency)
  return useQuery({
    queryKey: cashKeys.movements(params),
    queryFn: () => api.get<PageResponse<Movement>>(`${BASE}/movements?${query.toString()}`),
    placeholderData: keepPreviousData,
  })
}

/**
 * Refresh everything money-related (balances, ledger, expenses, advances). Exported for other features whose
 * actions move money: invoices, orders.
 */
export function useInvalidateCash() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: cashKeys.all }),
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
      queryClient.invalidateQueries({ queryKey: peopleKeys.all }),
    ])
}

function useCashMutation<T>(path: string) {
  const invalidate = useInvalidateCash()
  return useMutation({
    mutationFn: (input: T) => api.post<CashAccount[]>(`${BASE}/movements/${path}`, input),
    onSuccess: invalidate,
  })
}

export const useCapital = () => useCashMutation<CapitalInput>("capital")
export const useTransfer = () => useCashMutation<TransferInput>("transfer")
export const useExchange = () => useCashMutation<ExchangeInput>("exchange")
export const useAdjustment = () => useCashMutation<AdjustmentInput>("adjustment")

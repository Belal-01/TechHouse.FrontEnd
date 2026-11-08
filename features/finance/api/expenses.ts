"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { PageResponse } from "@/lib/api/types"
import type { Expense, ExpenseCategory, ExpenseInput, ExpenseListParams, ExpenseSummary } from "../types"
import { cashKeys } from "./cash"

const BASE = "/admin/finance"

export const expenseKeys = {
  all: ["finance", "expenses"] as const,
  list: (params: ExpenseListParams) => [...expenseKeys.all, "list", params] as const,
  summary: (from: string, to: string) => [...expenseKeys.all, "summary", from, to] as const,
  categories: () => ["finance", "expense-categories"] as const,
}

export function useExpenses(params: ExpenseListParams) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size), from: params.from, to: params.to })
  if (params.categoryId) query.set("categoryId", params.categoryId)
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => api.get<PageResponse<Expense>>(`${BASE}/expenses?${query.toString()}`),
    placeholderData: keepPreviousData,
  })
}

export function useExpenseSummary(from: string, to: string) {
  return useQuery({
    queryKey: expenseKeys.summary(from, to),
    queryFn: () => api.get<ExpenseSummary>(`${BASE}/expenses/summary?from=${from}&to=${to}`),
    placeholderData: keepPreviousData,
  })
}

/** Expenses move cash: refresh both the expense screens and the balances. */
function useInvalidateExpenses() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
      queryClient.invalidateQueries({ queryKey: cashKeys.all }),
    ])
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation({ mutationFn: (input: ExpenseInput) => api.post<Expense>(`${BASE}/expenses`, input), onSuccess: invalidate })
}

export function useVoidExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.post<Expense>(`${BASE}/expenses/${encodeURIComponent(id)}/void`, { note: note.trim() || null }),
    onSuccess: invalidate,
  })
}

// ---- Categories -------------------------------------------------------------------------

export function useExpenseCategories() {
  return useQuery({ queryKey: expenseKeys.categories(), queryFn: () => api.get<ExpenseCategory[]>(`${BASE}/expense-categories`) })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() }),
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
    ])
}

export type CategoryInput = { name: string; active: boolean; version?: number }

export function useCreateExpenseCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (input: CategoryInput) => api.post<ExpenseCategory>(`${BASE}/expense-categories`, input),
    onSuccess: invalidate,
  })
}

export function useUpdateExpenseCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, ...input }: CategoryInput & { id: string }) =>
      api.put<ExpenseCategory>(`${BASE}/expense-categories/${encodeURIComponent(id)}`, input),
    onSuccess: invalidate,
  })
}

export function useDeleteExpenseCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/expense-categories/${encodeURIComponent(id)}`),
    onSuccess: invalidate,
  })
}

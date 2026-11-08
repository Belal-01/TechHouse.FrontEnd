"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { AdvanceEntry, Currency, Person } from "../types"
import { cashKeys } from "./cash"
import { expenseKeys } from "./expenses"

const BASE = "/admin/finance/people"

export const peopleKeys = {
  all: ["finance", "people"] as const,
  list: () => [...peopleKeys.all, "list"] as const,
  detail: (id: string) => [...peopleKeys.all, "detail", id] as const,
  entries: (id: string) => [...peopleKeys.all, "entries", id] as const,
}

export function usePeople() {
  return useQuery({ queryKey: peopleKeys.list(), queryFn: () => api.get<Person[]>(BASE) })
}

export function usePerson(id: string) {
  return useQuery({ queryKey: peopleKeys.detail(id), queryFn: () => api.get<Person>(`${BASE}/${encodeURIComponent(id)}`) })
}

export function useAdvanceEntries(id: string) {
  return useQuery({
    queryKey: peopleKeys.entries(id),
    queryFn: () => api.get<AdvanceEntry[]>(`${BASE}/${encodeURIComponent(id)}/entries`),
  })
}

export type PersonInput = { name: string; phone: string | null; active: boolean; version?: number }

function useInvalidatePeople() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: peopleKeys.all })
}

export function useCreatePerson() {
  const invalidate = useInvalidatePeople()
  return useMutation({ mutationFn: (input: PersonInput) => api.post<Person>(BASE, input), onSuccess: invalidate })
}

export function useUpdatePerson() {
  const invalidate = useInvalidatePeople()
  return useMutation({
    mutationFn: ({ id, ...input }: PersonInput & { id: string }) => api.put<Person>(`${BASE}/${encodeURIComponent(id)}`, input),
    onSuccess: invalidate,
  })
}

export type AdvanceAction = "withdraw" | "return" | "spend"

/** withdraw / return: { accountId, currency, amount, note }. spend: { currency, amount, categoryId, expenseDate, description }. */
export type AdvanceInput =
  | { action: "withdraw" | "return"; accountId: string; currency: Currency; amount: number; note: string | null }
  | { action: "spend"; currency: Currency; amount: number; categoryId: string; expenseDate: string; description: string | null }

/** Advances move cash and (when spent) create expenses: refresh all three. */
export function useAdvanceAction(personId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ action, ...input }: AdvanceInput) => api.post<Person>(`${BASE}/${encodeURIComponent(personId)}/${action}`, input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: peopleKeys.all }),
        queryClient.invalidateQueries({ queryKey: cashKeys.all }),
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
      ]),
  })
}

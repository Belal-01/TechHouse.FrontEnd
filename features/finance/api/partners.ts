"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { useInvalidatePeople } from "./people"
import type { Partner, PartnerInput } from "../types"

const BASE = "/admin/finance/partners"

export const partnerKeys = {
  all: ["finance", "partners"] as const,
  list: () => [...partnerKeys.all, "list"] as const,
}

export function usePartners(enabled = true) {
  return useQuery({ queryKey: partnerKeys.list(), queryFn: () => api.get<Partner[]>(BASE), enabled })
}

/** Their funded totals change whenever an invoice is paid or voided. */
export function useInvalidatePartners() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: partnerKeys.all })
}

export function useCreatePartner() {
  const invalidatePartners = useInvalidatePartners()
  const invalidatePeople = useInvalidatePeople()
  const invalidate = () => Promise.all([invalidatePartners(), invalidatePeople()])
  return useMutation({ mutationFn: (input: PartnerInput) => api.post<Partner>(BASE, input), onSuccess: invalidate })
}

export function useUpdatePartner() {
  const invalidatePartners = useInvalidatePartners()
  const invalidatePeople = useInvalidatePeople()
  const invalidate = () => Promise.all([invalidatePartners(), invalidatePeople()])
  return useMutation({
    mutationFn: ({ id, ...input }: PartnerInput & { id: string }) => api.put<Partner>(`${BASE}/${encodeURIComponent(id)}`, input),
    onSuccess: invalidate,
  })
}

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { DeliveryCompany, DeliveryCompanyInput } from "../types"

const BASE = "/admin/sales/delivery-companies"

export const deliveryCompanyKeys = {
  all: ["sales", "delivery-companies"] as const,
}

export function useDeliveryCompanies() {
  return useQuery({
    queryKey: deliveryCompanyKeys.all,
    queryFn: () => api.get<DeliveryCompany[]>(BASE),
  })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: deliveryCompanyKeys.all })
}

export function useCreateDeliveryCompany() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: DeliveryCompanyInput) => api.post<DeliveryCompany>(BASE, input),
    onSuccess: invalidate,
  })
}

export function useUpdateDeliveryCompany() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, ...input }: DeliveryCompanyInput & { id: string }) =>
      api.put<DeliveryCompany>(`${BASE}/${encodeURIComponent(id)}`, input),
    onSuccess: invalidate,
  })
}

export function useDeleteDeliveryCompany() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/${encodeURIComponent(id)}`),
    onSuccess: invalidate,
  })
}

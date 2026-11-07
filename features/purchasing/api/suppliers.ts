"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Supplier, SupplierInput, SupplierListParams } from "../types"

const BASE = "/admin/procurement/suppliers"

export const supplierKeys = {
  all: ["purchasing", "suppliers"] as const,
  list: (params: SupplierListParams) => [...supplierKeys.all, "list", params] as const,
}

export function useSuppliers(params: SupplierListParams) {
  const query = new URLSearchParams()
  if (params.search.trim()) query.set("q", params.search.trim())
  if (params.active !== null) query.set("active", String(params.active))
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => api.get<Supplier[]>(`${BASE}?${query.toString()}`),
    placeholderData: keepPreviousData,
  })
}

function useInvalidateSuppliers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: supplierKeys.all })
}

export function useCreateSupplier() {
  const invalidate = useInvalidateSuppliers()
  return useMutation({
    mutationFn: (input: SupplierInput) => api.post<Supplier>(BASE, input),
    onSuccess: invalidate,
  })
}

export function useUpdateSupplier() {
  const invalidate = useInvalidateSuppliers()
  return useMutation({
    mutationFn: ({ id, ...input }: SupplierInput & { id: string }) =>
      api.put<Supplier>(`${BASE}/${encodeURIComponent(id)}`, input),
    onSuccess: invalidate,
  })
}

export function useDeleteSupplier() {
  const invalidate = useInvalidateSuppliers()
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/${encodeURIComponent(id)}`),
    onSuccess: invalidate,
  })
}

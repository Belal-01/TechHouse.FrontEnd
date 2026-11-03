"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Category, CategoryInput } from "../types"

const BASE = "/admin/catalog/categories"

// Query keys for this resource. Mutations invalidate `all`, which covers every list/detail below it.
export const categoryKeys = {
  all: ["catalog", "categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => api.get<Category[]>(BASE),
  })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (input: CategoryInput) => api.post<Category>(BASE, input),
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, ...input }: CategoryInput & { id: string }) =>
      api.put<Category>(`${BASE}/${encodeURIComponent(id)}`, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/${encodeURIComponent(id)}`),
    onSuccess: invalidate,
  })
}

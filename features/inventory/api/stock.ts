"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { ProductStock, StockItem } from "../types"

export const stockKeys = {
  all: ["inventory", "stock"] as const,
  product: (id: string) => [...stockKeys.all, "product", id] as const,
}

/** Stock per product (warehouse and on the way). Orders invalidate `stockKeys.all` when they move stock. */
export function useStock() {
  return useQuery({
    queryKey: stockKeys.all,
    queryFn: () => api.get<StockItem[]>("/admin/inventory/stock"),
  })
}

export function useProductStock(productId: string) {
  return useQuery({
    queryKey: stockKeys.product(productId),
    queryFn: () => api.get<ProductStock>(`/admin/inventory/stock/${encodeURIComponent(productId)}`),
  })
}

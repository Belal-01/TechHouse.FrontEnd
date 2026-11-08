"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { stockKeys } from "@/features/inventory"
import { api } from "@/lib/api/client"
import type { PageResponse } from "@/lib/api/types"
import type { OrderDetail, OrderInput, OrderListParams, OrderSummary, OrderTransition } from "../types"

const BASE = "/admin/sales/orders"

export const orderKeys = {
  all: ["sales", "orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
}

export function useOrders(params: OrderListParams) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.status) query.set("status", params.status)
  if (params.search.trim()) query.set("q", params.search.trim())
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => api.get<PageResponse<OrderSummary>>(`${BASE}?${query.toString()}`),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => api.get<OrderDetail>(`${BASE}/${encodeURIComponent(id)}`),
  })
}

/** Orders move stock and money: refresh lists, stock and (via the server) nothing else is cached that depends on them. */
function useStoreSavedOrder() {
  const queryClient = useQueryClient()
  return (order: OrderDetail) => {
    queryClient.setQueryData(orderKeys.detail(order.id), order)
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: stockKeys.all }),
    ])
  }
}

export function useCreateOrder() {
  const storeSaved = useStoreSavedOrder()
  return useMutation({
    mutationFn: (input: OrderInput) => api.post<OrderDetail>(BASE, input),
    onSuccess: storeSaved,
  })
}

export function useOrderTransition(orderId: string) {
  const storeSaved = useStoreSavedOrder()
  return useMutation({
    mutationFn: ({ transition, note }: { transition: OrderTransition; note: string }) =>
      api.post<OrderDetail>(`${BASE}/${encodeURIComponent(orderId)}/${transition}`, { note: note.trim() || null }),
    onSuccess: storeSaved,
  })
}

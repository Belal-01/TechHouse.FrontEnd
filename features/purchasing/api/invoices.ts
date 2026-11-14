"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { dashboardKeys } from "@/features/dashboard"
import { useInvalidateCash, useInvalidatePartners } from "@/features/finance"
import { stockKeys } from "@/features/inventory"
import { api, proxyUrl } from "@/lib/api/client"
import type { PageResponse } from "@/lib/api/types"
import type { AssignInput, CostInput, InvoiceDetail, InvoiceInput, InvoiceListParams, InvoiceSummary } from "../types"

const BASE = "/admin/procurement/invoices"

export const invoiceKeys = {
  all: ["purchasing", "invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: InvoiceListParams) => [...invoiceKeys.lists(), params] as const,
  detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
}

/** Opens the attached PDF through the BFF (same-origin, so the session cookie applies). */
export function invoiceAttachmentUrl(invoiceId: string): string {
  return proxyUrl(`${BASE}/${encodeURIComponent(invoiceId)}/attachment`)
}

export function useInvoices(params: InvoiceListParams) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.supplierId) query.set("supplierId", params.supplierId)
  if (params.status) query.set("status", params.status)
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => api.get<PageResponse<InvoiceSummary>>(`${BASE}?${query.toString()}`),
    placeholderData: keepPreviousData,
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => api.get<InvoiceDetail>(`${BASE}/${encodeURIComponent(id)}`),
  })
}

/**
 * After anything that changes an invoice: store the fresh invoice and refresh what it affects (the list, stock,
 * box balances and the partners' funded totals).
 */
function useInvoiceSaved() {
  const queryClient = useQueryClient()
  const invalidateCash = useInvalidateCash()
  const invalidatePartners = useInvalidatePartners()
  return (invoice: InvoiceDetail) => {
    queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice)
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: stockKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      invalidateCash(),
      invalidatePartners(),
    ])
  }
}

export function useCreateInvoice() {
  const saved = useInvoiceSaved()
  return useMutation({ mutationFn: (input: InvoiceInput) => api.post<InvoiceDetail>(BASE, input), onSuccess: saved })
}

/** The goods arrived: arrival costs, then the stock becomes sellable. */
export function useReceiveInvoice(invoiceId: string) {
  const saved = useInvoiceSaved()
  return useMutation({
    mutationFn: (costs: CostInput[]) => api.post<InvoiceDetail>(`${BASE}/${encodeURIComponent(invoiceId)}/receive`, { costs }),
    onSuccess: saved,
  })
}

export function useAddInvoiceCost(invoiceId: string) {
  const saved = useInvoiceSaved()
  return useMutation({
    mutationFn: (cost: CostInput) => api.post<InvoiceDetail>(`${BASE}/${encodeURIComponent(invoiceId)}/costs`, cost),
    onSuccess: saved,
  })
}

export function useRemoveInvoiceCost(invoiceId: string) {
  const saved = useInvoiceSaved()
  return useMutation({
    mutationFn: (costId: string) =>
      api.delete<InvoiceDetail>(`${BASE}/${encodeURIComponent(invoiceId)}/costs/${encodeURIComponent(costId)}`),
    onSuccess: saved,
  })
}

/** Says whose money an unassigned outside payment was. */
export function useAssignFunding(invoiceId: string) {
  const saved = useInvoiceSaved()
  return useMutation({
    mutationFn: ({ paymentId, ...input }: AssignInput & { paymentId: string }) =>
      api.post<InvoiceDetail>(`${BASE}/${encodeURIComponent(invoiceId)}/payments/${encodeURIComponent(paymentId)}/assign`, input),
    onSuccess: saved,
  })
}

function useRefreshInvoice(invoiceId: string) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) }),
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
    ])
}

/** Takes the invoice id per call, so the create form can upload right after the invoice exists. */
export function useUploadInvoiceAttachment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invoiceId, file }: { invoiceId: string; file: File }) =>
      api.upload<void>(`${BASE}/${encodeURIComponent(invoiceId)}/attachment`, file),
    onSuccess: (_data, { invoiceId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) }),
        queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
      ]),
  })
}

/** Voiding takes the stock out and gives the money back: refresh invoices, stock and balances. */
export function useVoidInvoice(invoiceId: string) {
  const saved = useInvoiceSaved()
  return useMutation({
    mutationFn: (note: string) =>
      api.post<InvoiceDetail>(`${BASE}/${encodeURIComponent(invoiceId)}/void`, { note: note.trim() || null }),
    onSuccess: saved,
  })
}

export function useDeleteInvoiceAttachment(invoiceId: string) {
  const refresh = useRefreshInvoice(invoiceId)
  return useMutation({
    mutationFn: () => api.delete(`${BASE}/${encodeURIComponent(invoiceId)}/attachment`),
    onSuccess: refresh,
  })
}

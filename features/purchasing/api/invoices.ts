"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, proxyUrl } from "@/lib/api/client"
import type { PageResponse } from "@/lib/api/types"
import type { InvoiceDetail, InvoiceInput, InvoiceListParams, InvoiceSummary } from "../types"

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

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InvoiceInput) => api.post<InvoiceDetail>(BASE, input),
    onSuccess: (invoice) => {
      queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice)
      return queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
    },
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

export function useDeleteInvoiceAttachment(invoiceId: string) {
  const refresh = useRefreshInvoice(invoiceId)
  return useMutation({
    mutationFn: () => api.delete(`${BASE}/${encodeURIComponent(invoiceId)}/attachment`),
    onSuccess: refresh,
  })
}

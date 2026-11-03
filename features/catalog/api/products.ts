"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, proxyUrl } from "@/lib/api/client"
import type { PageResponse } from "@/lib/api/types"
import type { ProductDetail, ProductImage, ProductInput, ProductListParams, ProductSummary } from "../types"

const BASE = "/admin/catalog/products"

export const productKeys = {
  all: ["catalog", "products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
}

export function productImageUrl(imageId: string): string {
  return proxyUrl(`/admin/catalog/images/${encodeURIComponent(imageId)}`)
}

function toQuery(params: ProductListParams): string {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size), sort: "name" })
  if (params.search.trim()) query.set("search", params.search.trim())
  if (params.categoryId) query.set("categoryId", params.categoryId)
  if (params.active !== null) query.set("active", String(params.active))
  return query.toString()
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => api.get<PageResponse<ProductSummary>>(`${BASE}?${toQuery(params)}`),
    // Keep showing the current page while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.get<ProductDetail>(`${BASE}/${encodeURIComponent(id)}`),
  })
}

/** After a save, put the fresh product in the cache and refresh lists. */
function useStoreSavedProduct() {
  const queryClient = useQueryClient()
  return (product: ProductDetail) => {
    queryClient.setQueryData(productKeys.detail(product.id), product)
    return queryClient.invalidateQueries({ queryKey: productKeys.lists() })
  }
}

export function useCreateProduct() {
  const storeSaved = useStoreSavedProduct()
  return useMutation({
    mutationFn: (input: ProductInput) => api.post<ProductDetail>(BASE, input),
    onSuccess: storeSaved,
  })
}

export function useUpdateProduct(id: string) {
  const storeSaved = useStoreSavedProduct()
  return useMutation({
    mutationFn: (input: ProductInput) => api.put<ProductDetail>(`${BASE}/${encodeURIComponent(id)}`, input),
    onSuccess: storeSaved,
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/${encodeURIComponent(id)}`),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// ---- Images ------------------------------------------------------------------------

function useRefreshProduct(productId: string) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) }),
      queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    ])
}

export function useUploadProductImage(productId: string) {
  const refresh = useRefreshProduct(productId)
  return useMutation({
    mutationFn: (file: File) => api.upload<ProductImage>(`${BASE}/${encodeURIComponent(productId)}/images`, file),
    onSuccess: refresh,
  })
}

export function useDeleteProductImage(productId: string) {
  const refresh = useRefreshProduct(productId)
  return useMutation({
    mutationFn: (imageId: string) =>
      api.delete(`${BASE}/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`),
    onSuccess: refresh,
  })
}

/** Reorders optimistically: the gallery moves at once and snaps back if the server refuses. */
export function useReorderProductImages(productId: string) {
  const queryClient = useQueryClient()
  const refresh = useRefreshProduct(productId)
  const key = productKeys.detail(productId)

  return useMutation({
    mutationFn: (imageIds: string[]) =>
      api.put<ProductImage[]>(`${BASE}/${encodeURIComponent(productId)}/images/order`, { imageIds }),
    onMutate: async (imageIds) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ProductDetail>(key)
      if (previous) {
        const byId = new Map(previous.images.map((image) => [image.id, image]))
        const images = imageIds.flatMap((id, position) => {
          const image = byId.get(id)
          return image ? [{ ...image, position }] : []
        })
        queryClient.setQueryData<ProductDetail>(key, { ...previous, images })
      }
      return { previous }
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: refresh,
  })
}

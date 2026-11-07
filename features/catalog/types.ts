// Mirrors the backend catalog DTOs (com.techhouse.catalog.dto).
// The backend omits null fields (Jackson NON_NULL), so nullable fields are optional here.

export type Category = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type CategoryInput = {
  name: string
}

export type CategorySummary = {
  id: string
  name: string
}

export type ProductImage = {
  id: string
  position: number
  contentType: string
  sizeBytes: number
}

export type ProductDetail = {
  id: string
  name: string
  description?: string | null
  category?: CategorySummary | null
  sku?: string | null
  barcode?: string | null
  sellingPrice: number
  warrantyMonths?: number | null
  specifications: Record<string, unknown>
  active: boolean
  images: ProductImage[]
  version: number
  createdAt: string
  updatedAt: string
}

export type ProductSummary = {
  id: string
  name: string
  category?: CategorySummary | null
  active: boolean
  sellingPrice: number
  primaryImageId?: string | null
  sku?: string | null
  updatedAt: string
}

export type ProductInput = {
  name: string
  description: string | null
  categoryId: string | null
  sku: string | null
  barcode: string | null
  sellingPrice: number
  warrantyMonths: number | null
  specifications: Record<string, string>
  active: boolean
  version?: number
}

export type ProductListParams = {
  search: string
  categoryId: string | null
  active: boolean | null
  page: number
  size: number
}

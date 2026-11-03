"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, Pencil, Plus, SearchX, Trash2 } from "lucide-react"
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { PaginationBar } from "@/components/common/pagination-bar"
import { RowActions } from "@/components/common/row-actions"
import { SearchInput } from "@/components/common/search-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { toUserMessage } from "@/lib/api/errors"
import { formatMoneyRange } from "@/lib/format"
import { useCategories } from "../api/categories"
import { useProducts } from "../api/products"
import type { ProductSummary } from "../types"
import { DeleteProductDialog } from "./delete-product-dialog"
import { ProductThumbnail } from "./product-thumbnail"

const PAGE_SIZE = 20
const STATUSES = ["all", "active", "inactive"] as const
const STATUS_ITEMS = [
  { value: "all", label: "كل الحالات" },
  { value: "active", label: "متاح للبيع" },
  { value: "inactive", label: "موقوف" },
]
const ALL_CATEGORIES = "all"

// Filters and page live in the URL, so reload, back/forward and shared links keep them.
const filterParsers = {
  q: parseAsString.withDefault(""),
  category: parseAsString.withDefault(ALL_CATEGORIES),
  status: parseAsStringLiteral(STATUSES).withDefault("all"),
  page: parseAsInteger.withDefault(1),
}

type Removal = { open: boolean; product: ProductSummary | null; session: number }

export function ProductsView() {
  const router = useRouter()
  const [filters, setFilters] = useQueryStates(filterParsers)
  const debouncedSearch = useDebouncedValue(filters.q, 300)
  const [removal, setRemoval] = useState<Removal>({ open: false, product: null, session: 0 })

  const categories = useCategories()
  const products = useProducts({
    search: debouncedSearch,
    categoryId: filters.category === ALL_CATEGORIES ? null : filters.category,
    active: filters.status === "all" ? null : filters.status === "active",
    page: Math.max(filters.page - 1, 0),
    size: PAGE_SIZE,
  })

  const hasFilters = filters.q !== "" || filters.category !== ALL_CATEGORIES || filters.status !== "all"
  const categoryItems = [
    { value: ALL_CATEGORIES, label: "كل التصنيفات" },
    ...(categories.data ?? []).map((category) => ({ value: category.id, label: category.name })),
  ]

  const columns: DataTableColumn<ProductSummary>[] = [
    {
      id: "product",
      header: "المنتج",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <ProductThumbnail imageId={product.primaryImageId} alt="" />
          <div className="flex min-w-0 flex-col">
            <Link
              href={`/catalog/products/${product.id}`}
              className="truncate font-semibold text-foreground hover:text-blue hover:underline"
            >
              {product.name}
            </Link>
            <span className="truncate text-xs text-muted-foreground">
              {product.variantCount > 1 ? `${product.variantCount} أنواع` : product.sku ? <span dir="ltr">{product.sku}</span> : "بدون رمز"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "التصنيف",
      className: "hidden text-muted-foreground md:table-cell",
      cell: (product) => product.category?.name ?? "—",
    },
    {
      id: "price",
      header: "السعر",
      cell: (product) => <span dir="ltr">{formatMoneyRange(product.minPrice, product.maxPrice)}</span>,
    },
    {
      id: "status",
      header: "الحالة",
      className: "hidden sm:table-cell",
      cell: (product) =>
        product.active ? <Badge variant="info">متاح للبيع</Badge> : <Badge variant="outline">موقوف</Badge>,
    },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (product) => (
        <RowActions
          label={`إجراءات ${product.name}`}
          actions={[
            { label: "تعديل", icon: Pencil, onSelect: () => router.push(`/catalog/products/${product.id}`) },
            {
              label: "حذف",
              icon: Trash2,
              variant: "destructive",
              onSelect: () => setRemoval((s) => ({ open: true, product, session: s.session + 1 })),
            },
          ]}
        />
      ),
    },
  ]

  const page = products.data
  const addButton = (variant: "default" | "outline") => (
    <ButtonLink variant={variant} href="/catalog/products/new">
      <Plus aria-hidden />
      إضافة منتج
    </ButtonLink>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="المنتجات" description="كل منتجاتك وأنواعها وأسعارها." actions={addButton("default")} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          label="بحث في المنتجات"
          placeholder="ابحث بالاسم أو الرمز أو الباركود"
          value={filters.q}
          onValueChange={(q) => setFilters({ q, page: 1 })}
          className="md:max-w-sm md:flex-1"
        />
        <Select
          items={categoryItems}
          value={filters.category}
          onValueChange={(category) => setFilters({ category: category ?? ALL_CATEGORIES, page: 1 })}
        >
          <SelectTrigger aria-label="التصنيف" className="w-full md:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={STATUS_ITEMS}
          value={filters.status}
          onValueChange={(status) => setFilters({ status: status ?? "all", page: 1 })}
        >
          <SelectTrigger aria-label="الحالة" className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button variant="ghost" onClick={() => setFilters({ q: "", category: ALL_CATEGORIES, status: "all", page: 1 })}>
            مسح الفلاتر
          </Button>
        ) : null}
      </div>

      <DataTable
        caption="قائمة المنتجات"
        columns={columns}
        rows={page?.content}
        getRowId={(product) => product.id}
        isLoading={products.isPending}
        loadingRows={8}
        error={products.isError ? toUserMessage(products.error) : null}
        onRetry={() => products.refetch()}
        className={products.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
        empty={
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="لا توجد نتائج"
              description="لا يوجد منتج يطابق البحث أو الفلاتر الحالية."
              action={
                <Button variant="outline" onClick={() => setFilters({ q: "", category: ALL_CATEGORIES, status: "all", page: 1 })}>
                  مسح الفلاتر
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title="لا توجد منتجات بعد"
              description="أضف أول منتج مع أنواعه وأسعاره وصوره."
              action={addButton("outline")}
            />
          )
        }
      />

      {page ? (
        <PaginationBar
          page={page.page}
          pageSize={page.size}
          totalElements={page.totalElements}
          totalPages={page.totalPages}
          onPageChange={(next) => setFilters({ page: next + 1 })}
        />
      ) : null}

      <DeleteProductDialog
        key={`delete-${removal.session}`}
        open={removal.open}
        onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
        product={removal.product}
      />
    </div>
  )
}

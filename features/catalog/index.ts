// Public, client-safe API of the catalog feature.
export { CategoriesView } from "./components/categories-view"
export { ProductsView } from "./components/products-view"
export { ProductCreateView } from "./components/product-create-view"
export { ProductEditView } from "./components/product-edit-view"
export { ProductFormSkeleton } from "./components/product-form-skeleton"
export type { Category, ProductDetail, ProductSummary } from "./types"
// Used by other features to pick products (e.g. purchase invoice lines).
export { useProducts } from "./api/products"

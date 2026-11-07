import type { ProductDetail, ProductInput } from "../types"
import type { ProductFormValues } from "../schemas/product.schema"

export const emptyProductForm: ProductFormValues = {
  name: "",
  description: "",
  categoryId: "",
  sellingPrice: "",
  sku: "",
  barcode: "",
  warrantyMonths: "",
  active: true,
  specifications: [],
}

/** API product → form values. */
export function toFormValues(product: ProductDetail): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? "",
    categoryId: product.category?.id ?? "",
    sellingPrice: String(product.sellingPrice),
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    warrantyMonths: product.warrantyMonths == null ? "" : String(product.warrantyMonths),
    active: product.active,
    specifications: Object.entries(product.specifications ?? {}).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
    })),
    version: product.version,
  }
}

/** Form values → API request. */
export function toProductInput(form: ProductFormValues): ProductInput {
  const blankToNull = (value: string) => (value.trim() === "" ? null : value.trim())
  return {
    name: form.name.trim(),
    description: blankToNull(form.description),
    categoryId: form.categoryId || null,
    sku: blankToNull(form.sku),
    barcode: blankToNull(form.barcode),
    sellingPrice: Number(form.sellingPrice),
    warrantyMonths: form.warrantyMonths.trim() === "" ? null : Number(form.warrantyMonths),
    specifications: Object.fromEntries(
      form.specifications.filter((spec) => spec.key.trim()).map((spec) => [spec.key.trim(), spec.value.trim()]),
    ),
    active: form.active,
    version: form.version,
  }
}

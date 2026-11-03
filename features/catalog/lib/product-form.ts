import type { ProductDetail, ProductInput } from "../types"
import type { OptionFormValues, ProductFormValues, VariantFormValues } from "../schemas/product.schema"

export function newOptionKey(): string {
  return crypto.randomUUID()
}

export function emptyVariant(sellingPrice = ""): VariantFormValues {
  return { optionValues: [], sellingPrice, sku: "", barcode: "", imageId: null, active: true }
}

export const emptyProductForm: ProductFormValues = {
  name: "",
  description: "",
  categoryId: "",
  warrantyMonths: "",
  active: true,
  hasVariants: false,
  options: [],
  variants: [emptyVariant()],
  specifications: [],
}

/** API product → form values. Option values are collected from the variants, in first-seen order. */
export function toFormValues(product: ProductDetail): ProductFormValues {
  const options: OptionFormValues[] = product.optionNames.map((name, index) => ({
    key: newOptionKey(),
    name,
    values: [...new Set(product.variants.map((variant) => variant.optionValues[index]))],
  }))

  return {
    name: product.name,
    description: product.description ?? "",
    categoryId: product.category?.id ?? "",
    warrantyMonths: product.warrantyMonths == null ? "" : String(product.warrantyMonths),
    active: product.active,
    hasVariants: options.length > 0,
    options,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      optionValues: variant.optionValues,
      sellingPrice: String(variant.sellingPrice),
      sku: variant.sku ?? "",
      barcode: variant.barcode ?? "",
      imageId: variant.imageId ?? null,
      active: variant.active,
    })),
    specifications: Object.entries(product.specifications ?? {}).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
    })),
    version: product.version,
  }
}

/** Form values → API request. Variants are sent in form order, so server errors like variants[2] match rows. */
export function toProductInput(form: ProductFormValues): ProductInput {
  const blankToNull = (value: string) => (value.trim() === "" ? null : value.trim())
  return {
    name: form.name.trim(),
    description: blankToNull(form.description),
    categoryId: form.categoryId || null,
    warrantyMonths: form.warrantyMonths.trim() === "" ? null : Number(form.warrantyMonths),
    specifications: Object.fromEntries(
      form.specifications.filter((spec) => spec.key.trim()).map((spec) => [spec.key.trim(), spec.value.trim()]),
    ),
    active: form.active,
    optionNames: form.hasVariants ? form.options.map((option) => option.name.trim()) : [],
    variants: form.variants.map((variant) => ({
      id: variant.id,
      optionValues: form.hasVariants ? variant.optionValues : [],
      sku: blankToNull(variant.sku),
      barcode: blankToNull(variant.barcode),
      sellingPrice: Number(variant.sellingPrice),
      imageId: variant.imageId,
      active: variant.active,
    })),
    version: form.version,
  }
}

function cartesian(lists: string[][]): string[][] {
  if (lists.length === 0 || lists.some((list) => list.length === 0)) return []
  return lists.reduce<string[][]>((combos, list) => combos.flatMap((combo) => list.map((value) => [...combo, value])), [[]])
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * All combinations of the new options, reusing existing variants (id, price, SKU...) wherever the shared
 * options still have the same values. A newly added option only inherits on its first value, so adding
 * "السعة" to an existing "اللون" product keeps the old variants as the first size, and the rest are new.
 */
export function buildVariants(
  previousOptions: OptionFormValues[],
  nextOptions: OptionFormValues[],
  currentVariants: VariantFormValues[],
  defaultPrice = "",
): VariantFormValues[] {
  const previousIndex = new Map(previousOptions.map((option, index) => [option.key, index]))
  const used = new Set<VariantFormValues>()

  return cartesian(nextOptions.map((option) => option.values)).map((combo) => {
    const match = currentVariants.find((variant) => {
      if (used.has(variant)) return false
      return nextOptions.every((option, index) => {
        const before = previousIndex.get(option.key)
        if (before === undefined) return same(combo[index], option.values[0])
        const value = variant.optionValues[before]
        return value !== undefined && same(value, combo[index])
      })
    })
    if (match) {
      used.add(match)
      return { ...match, optionValues: combo }
    }
    return { ...emptyVariant(defaultPrice), optionValues: combo }
  })
}

"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle, Trash2 } from "lucide-react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import { ButtonLink } from "@/components/common/button-link"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { useCreateProduct, useUpdateProduct } from "../../api/products"
import { emptyProductForm, toFormValues, toProductInput } from "../../lib/product-form"
import { productFormSchema, type ProductFormValues } from "../../schemas/product.schema"
import type { ProductDetail, ProductImage } from "../../types"
import { DeleteProductDialog } from "../delete-product-dialog"
import { BasicInfoCard } from "./basic-info-card"
import { PricingCard } from "./pricing-card"
import { OrganizationCard, StatusCard } from "./side-cards"
import { SpecificationsCard } from "./specifications-card"

type ProductFormProps = {
  /** Present when editing. Read once for the initial values; remount (key) to load another product. */
  product?: ProductDetail
  /** The live gallery (edit only), for the variants' image picker. */
  images?: ProductImage[]
  /** Rendered between the basic info and the pricing cards, e.g. the image manager. */
  mediaSlot?: ReactNode
}

/** Server field paths (dot form) → this form's field paths. Unknown fields fall back to a form-level message. */
function mapProductField(path: string): string | null {
  const option = /^optionNames\.(\d+)$/.exec(path)
  if (option) return `options.${option[1]}.name`
  if (path === "optionNames") return "options"
  const values = /^variants\.(\d+)\.optionValues(\.\d+)?$/.exec(path)
  if (values) return `variants.${values[1]}.optionValues`
  if (/^variants\.\d+\.(sku|barcode|sellingPrice|imageId)$/.test(path)) return path
  if (["name", "description", "categoryId", "warrantyMonths", "variants"].includes(path)) return path
  return null
}

export function ProductForm({ product, images = [], mediaSlot }: ProductFormProps) {
  const router = useRouter()
  const isEdit = product !== undefined
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(product?.id ?? "")
  const isPending = createProduct.isPending || updateProduct.isPending
  const [formError, setFormError] = useState<string | null>(null)
  const [removal, setRemoval] = useState({ open: false, session: 0 })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? toFormValues(product) : emptyProductForm,
    mode: "onTouched",
  })
  useUnsavedChangesWarning(form.formState.isDirty && !isPending)

  const onSubmit = form.handleSubmit(
    async (values) => {
      setFormError(null)
      // An image removed from the gallery after the variant picked it is no longer valid.
      const liveImageIds = new Set(images.map((image) => image.id))
      const input = toProductInput({
        ...values,
        variants: values.variants.map((v) => ({ ...v, imageId: v.imageId && liveImageIds.has(v.imageId) ? v.imageId : null })),
      })
      try {
        if (isEdit) {
          const saved = await updateProduct.mutateAsync(input)
          form.reset(toFormValues(saved))
          toast.success("تم حفظ المنتج")
        } else {
          const saved = await createProduct.mutateAsync(input)
          form.reset(toFormValues(saved))
          toast.success("تم إنشاء المنتج. يمكنك الآن إضافة الصور.")
          router.replace(`/catalog/products/${saved.id}`)
        }
      } catch (error) {
        if (!applyApiError(error, form.setError, { mapField: mapProductField })) setFormError(toUserMessage(error))
      }
    },
    () => setFormError("تحقّق من الحقول المعلّمة بالأحمر."),
  )

  const title = isEdit ? product.name : "منتج جديد"

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-6">
        {/* Sticky under the app header so Save stays reachable on long forms. */}
        <div className="sticky top-16 z-10 -mx-4 -mt-6 flex flex-col gap-3 border-b bg-background px-4 py-4 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
          <div className="flex min-w-0 flex-col gap-1">
            <Link href="/catalog/products" className="inline-flex items-center gap-1 small text-muted-foreground hover:text-foreground">
              <ArrowRight className="size-4" aria-hidden />
              المنتجات
            </Link>
            <h1 className="truncate h2">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Button type="button" variant="ghost" onClick={() => setRemoval((s) => ({ open: true, session: s.session + 1 }))}>
                <Trash2 aria-hidden />
                حذف
              </Button>
            ) : null}
            <ButtonLink variant="outline" href="/catalog/products">
              إلغاء
            </ButtonLink>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
              {isEdit ? "حفظ التعديلات" : "إنشاء المنتج"}
            </Button>
          </div>
        </div>

        {formError ? <Alert>{formError}</Alert> : null}

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <BasicInfoCard />
            {mediaSlot}
            <PricingCard images={images} />
            <SpecificationsCard />
          </div>
          <div className="flex flex-col gap-6">
            <StatusCard />
            <OrganizationCard />
          </div>
        </div>
      </form>

      {isEdit ? (
        <DeleteProductDialog
          key={`delete-${removal.session}`}
          open={removal.open}
          onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
          product={{ id: product.id, name: product.name }}
          onDeleted={() => {
            form.reset(form.getValues())
            router.replace("/catalog/products")
          }}
        />
      ) : null}
    </FormProvider>
  )
}

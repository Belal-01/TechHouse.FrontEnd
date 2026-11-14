"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Trash2 } from "lucide-react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import { ButtonLink } from "@/components/common/button-link"
import { FormPageHeader } from "@/components/common/form-page-header"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning"
import { toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { useCreateProduct, useUpdateProduct } from "../../api/products"
import { emptyProductForm, toFormValues, toProductInput } from "../../lib/product-form"
import { productFormSchema, type ProductFormValues } from "../../schemas/product.schema"
import type { ProductDetail } from "../../types"
import { DeleteProductDialog } from "../delete-product-dialog"
import { BasicInfoCard } from "./basic-info-card"
import { PricingCard } from "./pricing-card"
import { OrganizationCard, StatusCard } from "./side-cards"
import { SpecificationsCard } from "./specifications-card"

type ProductFormProps = {
  /** Present when editing. Read once for the initial values; remount (key) to load another product. */
  product?: ProductDetail
  /** Rendered between the basic info and the pricing cards, e.g. the image manager. */
  mediaSlot?: ReactNode
}

/** Server field paths (dot form) → this form's field paths. Unknown fields fall back to a form-level message. */
function mapProductField(path: string): string | null {
  const fields = ["name", "description", "categoryId", "sku", "barcode", "sellingPrice", "warrantyMonths"]
  return fields.includes(path) ? path : null
}

export function ProductForm({ product, mediaSlot }: ProductFormProps) {
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
      const input = toProductInput(values)
      try {
        if (isEdit) {
          const saved = await updateProduct.mutateAsync(input)
          form.reset(toFormValues(saved))
          toast.success("تم حفظ المنتج")
        } else {
          const saved = await createProduct.mutateAsync(input)
          // Clear the form (also drops the unsaved-changes guard) and go back to the list, ready for the next product.
          form.reset(emptyProductForm)
          toast.success(`تم إنشاء المنتج "${saved.name}"`, {
            action: { label: "إضافة الصور", onClick: () => router.push(`/catalog/products/${saved.id}`) },
          })
          router.push("/catalog/products")
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
        <FormPageHeader
          title={title}
          backHref="/catalog/products"
          backLabel="المنتجات"
          actions={
            <>
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
            </>
          }
        />

        {formError ? <Alert>{formError}</Alert> : null}

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <BasicInfoCard />
            {mediaSlot}
            <PricingCard />
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

"use client"

import { PackageX } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { EmptyState } from "@/components/common/empty-state"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ApiError, toUserMessage } from "@/lib/api/errors"
import { useProduct } from "../api/products"
import { ProductForm } from "./product-form/product-form"
import { ProductFormSkeleton } from "./product-form-skeleton"
import { ProductImagesManager } from "./product-images-manager"

export function ProductEditView({ productId }: { productId: string }) {
  const product = useProduct(productId)

  if (product.isPending) return <ProductFormSkeleton />

  if (product.isError) {
    if (product.error instanceof ApiError && product.error.status === 404) {
      return (
        <EmptyState
          icon={PackageX}
          title="المنتج غير موجود"
          description="ربما حُذف هذا المنتج."
          action={
            <ButtonLink variant="outline" href="/catalog/products">
              العودة إلى المنتجات
            </ButtonLink>
          }
        />
      )
    }
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert>{toUserMessage(product.error)}</Alert>
        <Button variant="outline" onClick={() => product.refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  const { data } = product
  return (
    <ProductForm
      key={data.id}
      product={data}
      images={data.images}
      mediaSlot={<ProductImagesManager productId={data.id} images={data.images} />}
    />
  )
}

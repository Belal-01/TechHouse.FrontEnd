import Image from "next/image"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { productImageUrl } from "../api/products"

type ProductThumbnailProps = {
  imageId?: string | null
  alt: string
  className?: string
}

// `unoptimized`: images come through the authenticated BFF, which Next's image optimizer can't call.
export function ProductThumbnail({ imageId, alt, className }: ProductThumbnailProps) {
  return (
    <span className={cn("relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-muted", className)}>
      {imageId ? (
        <Image src={productImageUrl(imageId)} alt={alt} fill sizes="80px" unoptimized className="object-cover" />
      ) : (
        <Package className="size-4 text-muted-foreground" aria-hidden />
      )}
    </span>
  )
}

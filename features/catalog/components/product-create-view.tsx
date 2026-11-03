"use client"

import { ImageOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "./product-form/product-form"

export function ProductCreateView() {
  return (
    <ProductForm
      mediaSlot={
        <Card>
          <CardHeader>
            <CardTitle>الصور</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 small text-muted-foreground">
            <ImageOff className="size-5 shrink-0" aria-hidden />
            احفظ المنتج أولاً، ثم أضف صوره من صفحة المنتج.
          </CardContent>
        </Card>
      }
    />
  )
}

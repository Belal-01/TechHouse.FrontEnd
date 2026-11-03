"use client"

import { useRef, useState, type DragEvent } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toUserMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"
import { useDeleteProductImage, useReorderProductImages, useUploadProductImage } from "../api/products"
import type { ProductImage } from "../types"
import { ProductThumbnail } from "./product-thumbnail"

const MAX_IMAGES = 10
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"]

type ProductImagesManagerProps = {
  productId: string
  images: ProductImage[]
}

export function ProductImagesManager({ productId, images }: ProductImagesManagerProps) {
  const upload = useUploadProductImage(productId)
  const reorder = useReorderProductImages(productId)
  const remove = useDeleteProductImage(productId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [removal, setRemoval] = useState<{ open: boolean; image: ProductImage | null; session: number }>({
    open: false,
    image: null,
    session: 0,
  })

  const sensors = useSensors(
    // A small distance so a click on a tile's buttons isn't treated as the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const slotsLeft = MAX_IMAGES - images.length - pending
  const position = (id: string | number) => images.findIndex((image) => image.id === id) + 1

  const announcements: Announcements = {
    onDragStart: ({ active }) => `تم التقاط الصورة ${position(active.id)}.`,
    onDragOver: ({ over }) => (over ? `فوق الموضع ${position(over.id)}.` : "خارج المعرض."),
    onDragEnd: ({ over }) => (over ? `أُفلتت الصورة في الموضع ${position(over.id)}.` : "أُلغي النقل."),
    onDragCancel: () => "أُلغي النقل.",
  }

  const saveOrder = (ids: string[]) =>
    reorder.mutate(ids, { onError: (error) => toast.error(toUserMessage(error)) })

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = images.map((image) => image.id)
    saveOrder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  const makePrimary = (id: string) => saveOrder([id, ...images.map((image) => image.id).filter((other) => other !== id)])

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList) return
    const files = Array.from(fileList)
    const accepted = files.filter((file) => {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`${file.name}: صيغة غير مدعومة. استخدم JPEG أو PNG أو WebP.`)
        return false
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: حجم الصورة أكبر من 5 ميغابايت.`)
        return false
      }
      return true
    })
    const room = MAX_IMAGES - images.length - pending
    if (accepted.length > room) toast.error(`يمكن إضافة ${Math.max(room, 0)} صور فقط. الحد الأقصى ${MAX_IMAGES} صور لكل منتج.`)
    const batch = accepted.slice(0, Math.max(room, 0))
    if (batch.length === 0) return

    setPending((count) => count + batch.length)
    for (const file of batch) {
      try {
        await upload.mutateAsync(file)
      } catch (error) {
        toast.error(`${file.name}: ${toUserMessage(error)}`)
      } finally {
        setPending((count) => count - 1)
      }
    }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    void addFiles(event.dataTransfer.files)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>الصور</CardTitle>
        <CardDescription>
          الصورة الأولى هي الرئيسية. اسحب الصور لترتيبها. حتى {MAX_IMAGES} صور، بصيغة JPEG أو PNG أو WebP وحجم 5MB كحد أقصى.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable: "لتحريك الصورة: اضغط المسافة، ثم استخدم الأسهم، ثم المسافة للإفلات أو Escape للإلغاء.",
            },
          }}
        >
          <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-label="معرض الصور">
              {images.map((image, index) => (
                <SortableImageTile
                  key={image.id}
                  image={image}
                  index={index}
                  onMakePrimary={() => makePrimary(image.id)}
                  onDelete={() => setRemoval((s) => ({ open: true, image, session: s.session + 1 }))}
                />
              ))}

              {Array.from({ length: pending }, (_, i) => (
                <li key={`pending-${i}`} className="flex aspect-square items-center justify-center rounded-md border bg-muted">
                  <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-label="جارٍ الرفع" />
                </li>
              ))}

              {slotsLeft > 0 ? (
                <li>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-3 text-center transition-colors",
                      dragOver && "border-blue bg-blue-tint",
                    )}
                  >
                    <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
                    <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                      إضافة صور
                    </Button>
                    <span className="text-xs text-muted-foreground">أو اسحبها إلى هنا · متبقٍ {slotsLeft}</span>
                    <input
                      ref={inputRef}
                      type="file"
                      accept={ACCEPTED.join(",")}
                      multiple
                      className="sr-only"
                      tabIndex={-1}
                      aria-label="اختيار صور المنتج"
                      onChange={(event) => {
                        void addFiles(event.target.files)
                        event.target.value = ""
                      }}
                    />
                  </div>
                </li>
              ) : null}
            </ul>
          </SortableContext>
        </DndContext>

        <ConfirmDialog
          key={`remove-${removal.session}`}
          open={removal.open}
          onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
          title="حذف الصورة؟"
          description="ستُحذف الصورة من المعرض، وتُزال من أي نوع يستخدمها."
          confirmLabel="حذف"
          cancelLabel="إلغاء"
          isPending={remove.isPending}
          onConfirm={() => {
            if (!removal.image) return
            remove.mutate(removal.image.id, {
              onSuccess: () => {
                toast.success("تم حذف الصورة")
                setRemoval((s) => ({ ...s, open: false }))
              },
              onError: (error) => toast.error(toUserMessage(error)),
            })
          }}
        />
      </CardContent>
    </Card>
  )
}

type TileProps = {
  image: ProductImage
  index: number
  onMakePrimary: () => void
  onDelete: () => void
}

function SortableImageTile({ image, index, onMakePrimary, onDelete }: TileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })
  const label = index === 0 ? "الصورة الرئيسية" : `الصورة ${index + 1}`

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative aspect-square", isDragging && "z-10 opacity-80")}
    >
      <div
        {...attributes}
        {...listeners}
        aria-label={`${label}. اسحب لتغيير الترتيب.`}
        aria-roledescription="صورة قابلة للسحب"
        className="h-full w-full cursor-grab rounded-md active:cursor-grabbing"
      >
        <ProductThumbnail imageId={image.id} alt={label} className="size-full rounded-md" />
      </div>
      {index === 0 ? (
        <Badge variant="info" className="pointer-events-none absolute inset-s-2 top-2">
          الرئيسية
        </Badge>
      ) : null}
      <div className="absolute inset-e-2 top-2 flex gap-1">
        {index > 0 ? (
          <Button type="button" variant="outline" size="icon-sm" aria-label={`جعل ${label} الرئيسية`} onClick={onMakePrimary}>
            <Star aria-hidden />
          </Button>
        ) : null}
        <Button type="button" variant="outline" size="icon-sm" aria-label={`حذف ${label}`} onClick={onDelete}>
          <Trash2 aria-hidden />
        </Button>
      </div>
    </li>
  )
}

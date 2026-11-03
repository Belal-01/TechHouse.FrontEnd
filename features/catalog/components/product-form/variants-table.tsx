"use client"

import { useState } from "react"
import { Controller, useFormContext, type FieldArrayWithId } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProductFormValues } from "../../schemas/product.schema"
import type { ProductImage } from "../../types"
import { ProductThumbnail } from "../product-thumbnail"
import { PriceInput } from "./price-input"

const NO_IMAGE = "none"

type VariantsTableProps = {
  fields: FieldArrayWithId<ProductFormValues, "variants">[]
  images: ProductImage[]
}

function CellError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs whitespace-normal text-red">{message}</p> : null
}

export function VariantsTable({ fields, images }: VariantsTableProps) {
  const {
    control,
    register,
    getValues,
    setValue,
    formState: { errors, isSubmitted },
  } = useFormContext<ProductFormValues>()
  const [bulkPrice, setBulkPrice] = useState("")

  if (fields.length === 0) {
    return <p className="small text-muted-foreground">أضف قيمة واحدة على الأقل لكل خيار لتظهر الأنواع هنا.</p>
  }

  const applyBulkPrice = () => {
    if (!bulkPrice.trim()) return
    getValues("variants").forEach((_, index) =>
      setValue(`variants.${index}.sellingPrice`, bulkPrice.trim(), { shouldDirty: true, shouldValidate: isSubmitted }),
    )
  }

  const imageItems = [
    { value: NO_IMAGE, label: "بدون صورة" },
    ...images.map((image, index) => ({ value: image.id, label: `صورة ${index + 1}` })),
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-sm font-semibold">الأنواع ({fields.length})</h3>
        <div className="flex items-center gap-2">
          <PriceInput aria-label="سعر لكل الأنواع" className="h-9 w-32" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} />
          <Button type="button" variant="outline" size="sm" onClick={applyBulkPrice}>
            تطبيق على الكل
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">النوع</TableHead>
              <TableHead scope="col" className="w-32">السعر</TableHead>
              <TableHead scope="col" className="w-44">الرمز (SKU)</TableHead>
              <TableHead scope="col" className="w-40">الباركود</TableHead>
              {images.length > 0 ? <TableHead scope="col" className="w-40">الصورة</TableHead> : null}
              <TableHead scope="col" className="w-20 text-center">متاح</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const error = errors.variants?.[index]
              const label = field.optionValues.join(" / ")
              return (
                <TableRow key={field.id} className="align-top hover:bg-transparent">
                  <TableCell className="py-3 font-semibold">
                    {label}
                    <CellError message={error?.optionValues?.message} />
                  </TableCell>
                  <TableCell className="py-3">
                    <PriceInput
                      aria-label={`سعر ${label}`}
                      className="h-9"
                      aria-invalid={error?.sellingPrice ? true : undefined}
                      {...register(`variants.${index}.sellingPrice`)}
                    />
                    <CellError message={error?.sellingPrice?.message} />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      aria-label={`رمز ${label}`}
                      dir="ltr"
                      maxLength={50}
                      className="h-9"
                      aria-invalid={error?.sku ? true : undefined}
                      {...register(`variants.${index}.sku`)}
                    />
                    <CellError message={error?.sku?.message} />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      aria-label={`باركود ${label}`}
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={64}
                      className="h-9"
                      aria-invalid={error?.barcode ? true : undefined}
                      {...register(`variants.${index}.barcode`)}
                    />
                    <CellError message={error?.barcode?.message} />
                  </TableCell>
                  {images.length > 0 ? (
                    <TableCell className="py-3">
                      <Controller
                        control={control}
                        name={`variants.${index}.imageId`}
                        render={({ field: imageField }) => {
                          const current = imageField.value && images.some((i) => i.id === imageField.value) ? imageField.value : NO_IMAGE
                          return (
                            <Select
                              items={imageItems}
                              value={current}
                              onValueChange={(value) => imageField.onChange(!value || value === NO_IMAGE ? null : value)}
                            >
                              <SelectTrigger size="sm" aria-label={`صورة ${label}`} className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {imageItems.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.value !== NO_IMAGE ? <ProductThumbnail imageId={item.value} alt="" className="size-6" /> : null}
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )
                        }}
                      />
                      <CellError message={error?.imageId?.message} />
                    </TableCell>
                  ) : null}
                  <TableCell className="py-3 text-center">
                    <Controller
                      control={control}
                      name={`variants.${index}.active`}
                      render={({ field: activeField }) => (
                        <Switch size="sm" aria-label={`${label} متاح للبيع`} checked={activeField.value} onCheckedChange={activeField.onChange} />
                      )}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

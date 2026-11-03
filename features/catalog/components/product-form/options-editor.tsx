"use client"

import { Plus, Trash2 } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { TagInput } from "@/components/common/tag-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newOptionKey } from "../../lib/product-form"
import { MAX_OPTIONS, type OptionFormValues, type ProductFormValues } from "../../schemas/product.schema"

type OptionsEditorProps = {
  options: OptionFormValues[]
  /** Called with the new options whenever they change; the parent regenerates the variants. */
  onChange: (options: OptionFormValues[]) => void
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const {
    setValue,
    formState: { errors, isSubmitted },
  } = useFormContext<ProductFormValues>()

  const update = (index: number, patch: Partial<OptionFormValues>) =>
    onChange(options.map((option, i) => (i === index ? { ...option, ...patch } : option)))

  // A rename doesn't change the combinations, so it doesn't regenerate the variants.
  const rename = (index: number, name: string) =>
    setValue(`options.${index}.name`, name, { shouldDirty: true, shouldValidate: isSubmitted })

  const rootError = isSubmitted ? (errors.options?.message ?? errors.options?.root?.message) : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">الخيارات</h3>
        <p className="small text-muted-foreground">
          أضف حتى {MAX_OPTIONS} خيارات، ثم اكتب قيم كل خيار واضغط Enter. تُنشأ الأنواع تلقائياً من كل التركيبات.
        </p>
      </div>

      {options.map((option, index) => {
        const error = errors.options?.[index]
        const nameId = `option-${option.key}-name`
        const valuesId = `option-${option.key}-values`
        return (
          <fieldset key={option.key} className="flex flex-col gap-3 rounded-md border p-4">
            <legend className="sr-only">الخيار {index + 1}</legend>
            <div className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor={nameId} className="text-sm font-semibold">
                  اسم الخيار
                </label>
                <Input
                  id={nameId}
                  value={option.name}
                  placeholder={index === 0 ? "اللون" : index === 1 ? "السعة" : "المقاس"}
                  maxLength={50}
                  aria-invalid={error?.name ? true : undefined}
                  aria-describedby={error?.name ? `${nameId}-error` : undefined}
                  onChange={(event) => rename(index, event.target.value)}
                />
                {error?.name ? (
                  <p id={`${nameId}-error`} className="small text-red">
                    {error.name.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                aria-label={`حذف الخيار ${option.name || index + 1}`}
                onClick={() => onChange(options.filter((_, i) => i !== index))}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={valuesId} className="text-sm font-semibold">
                القيم
              </label>
              <TagInput
                id={valuesId}
                value={option.values}
                onChange={(values) => update(index, { values })}
                placeholder={index === 0 ? "أسود، أبيض، أزرق..." : "اكتب قيمة واضغط Enter"}
                invalid={Boolean(error?.values)}
                describedBy={error?.values ? `${valuesId}-error` : undefined}
              />
              {error?.values ? (
                <p id={`${valuesId}-error`} className="small text-red">
                  {error.values.message ?? error.values.root?.message}
                </p>
              ) : null}
            </div>
          </fieldset>
        )
      })}

      {rootError ? <p className="small text-red" role="alert">{rootError}</p> : null}

      {options.length < MAX_OPTIONS ? (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => onChange([...options, { key: newOptionKey(), name: "", values: [] }])}
        >
          <Plus aria-hidden />
          إضافة خيار
        </Button>
      ) : null}
    </div>
  )
}

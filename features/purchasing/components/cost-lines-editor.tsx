"use client"

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { CurrencySelect } from "@/components/common/currency-select"
import { PriceInput } from "@/components/common/price-input"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fieldA11y } from "@/lib/field-a11y"
import { formatMoney } from "@/lib/format"
import { COST_KIND_LABELS, costUsd, emptyCost } from "../lib/invoice-form"
import { MAX_INVOICE_COSTS, type CostLineValues } from "../schemas/invoice.schema"
import type { CostKind } from "../types"
import { PayerSelect } from "./payer-select"

const KIND_ITEMS = (Object.keys(COST_KIND_LABELS) as CostKind[]).map((value) => ({ value, label: COST_KIND_LABELS[value] }))

type CostLinesEditorProps = {
  /** Prefix for element ids, unique per form on the page. */
  idPrefix: string
  /** The kind a newly added line starts with. */
  newKind: CostKind
  /** For the "≈ $" hint on SYP amounts. */
  sellRate: number | null
  /** One fixed line: no add / remove (adding a single cost). */
  single?: boolean
  emptyText?: string
}

type CostsForm = { costs: CostLineValues[] }

/** The cost lines of a form whose `costs` field holds them: what it was, how much, in which currency, who paid. */
export function CostLinesEditor({ idPrefix, newKind, sellRate, single = false, emptyText }: CostLinesEditorProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CostsForm>()
  const { fields, append, remove } = useFieldArray({ control, name: "costs" })
  const costs = useWatch({ control, name: "costs" })

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && emptyText ? <p className="small text-muted-foreground">{emptyText}</p> : null}
      <ol className="flex flex-col gap-3" aria-label="التكاليف">
        {fields.map((field, index) => {
          const id = (name: string) => `${idPrefix}-${index}-${name}`
          const lineErrors = errors.costs?.[index]
          const cost = costs?.[index]
          const usd = cost && cost.currency === "SYP" ? costUsd(cost, sellRate) : 0
          return (
            <li key={field.id} className="flex flex-col gap-3 rounded-md border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Controller
                  control={control}
                  name={`costs.${index}.kind`}
                  render={({ field: kind }) => (
                    <FormField id={id("kind")} label="التكلفة">
                      <Select items={KIND_ITEMS} value={kind.value} onValueChange={(value) => value && kind.onChange(value)}>
                        <SelectTrigger id={id("kind")} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {KIND_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />
                <FormField
                  id={id("description")}
                  label="التفاصيل"
                  description={cost?.kind === "OTHER" ? undefined : "اختياري."}
                  error={lineErrors?.description?.message}
                >
                  <Input id={id("description")} maxLength={255} {...fieldA11y(id("description"), lineErrors?.description)} {...register(`costs.${index}.description`)} />
                </FormField>
                <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-3">
                  <FormField
                    id={id("amount")}
                    label="المبلغ"
                    description={usd > 0 ? <span dir="ltr">≈ {formatMoney(usd)}</span> : undefined}
                    error={lineErrors?.amount?.message}
                  >
                    <PriceInput id={id("amount")} currency={cost?.currency ?? "USD"} {...fieldA11y(id("amount"), lineErrors?.amount)} {...register(`costs.${index}.amount`)} />
                  </FormField>
                  <Controller
                    control={control}
                    name={`costs.${index}.currency`}
                    render={({ field: currency }) => (
                      <FormField id={id("currency")} label="العملة">
                        <CurrencySelect id={id("currency")} value={currency.value} onValueChange={currency.onChange} />
                      </FormField>
                    )}
                  />
                </div>
                <Controller
                  control={control}
                  name={`costs.${index}.payer`}
                  render={({ field: payer }) => (
                    <FormField
                      id={id("payer")}
                      label="دفعها"
                      description={payer.value.startsWith("ACCOUNT") ? "تُخصم من الصندوق بعملة التكلفة." : "من ماله الخاص، لا تمر بالصناديق."}
                      error={lineErrors?.payer?.message}
                    >
                      <PayerSelect id={id("payer")} value={payer.value} onValueChange={payer.onChange} {...fieldA11y(id("payer"), lineErrors?.payer)} />
                    </FormField>
                  )}
                />
              </div>
              {single ? null : (
                <Button type="button" variant="ghost" size="sm" className="self-end" onClick={() => remove(index)} aria-label={`حذف التكلفة ${index + 1}`}>
                  <Trash2 aria-hidden />
                  حذف
                </Button>
              )}
            </li>
          )
        })}
      </ol>
      {single ? null : (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={fields.length >= MAX_INVOICE_COSTS}
          onClick={() => append(emptyCost(newKind), { focusName: `costs.${fields.length}.amount` })}
        >
          <Plus aria-hidden />
          إضافة تكلفة
        </Button>
      )}
    </div>
  )
}

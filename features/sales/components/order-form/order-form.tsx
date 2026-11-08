"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import { ButtonLink } from "@/components/common/button-link"
import { FormPageHeader } from "@/components/common/form-page-header"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useCurrentRate } from "@/features/finance"
import { stockKeys } from "@/features/inventory"
import { useHydrated } from "@/hooks/use-hydrated"
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning"
import { ApiError, toUserMessage } from "@/lib/api/errors"
import { applyApiError } from "@/lib/api/form-errors"
import { useCreateOrder } from "../../api/orders"
import { emptyOrderForm, toOrderInput } from "../../lib/order-form"
import { orderFormSchema, type OrderFormValues } from "../../schemas/order.schema"
import { CustomerCard } from "./customer-card"
import { DeliveryCard } from "./delivery-card"
import { LinesCard } from "./lines-card"
import { SummaryCard } from "./summary-card"

const FORM_FIELDS = ["customerName", "customerPhone", "customerAddress", "currency", "deliveryCompanyId", "deliveryCost", "deliveryCostCurrency", "deliveryFeeCharged", "notes"]

function mapOrderField(path: string): string | null {
  if (/^items\.\d+\.(productId|quantity|unitPrice)$/.test(path)) return path
  return FORM_FIELDS.includes(path) ? path : null
}

const COMPANY_CODES = { DELIVERY_COMPANY_NOT_FOUND: "deliveryCompanyId", DELIVERY_COMPANY_INACTIVE: "deliveryCompanyId" } as const

/** Converts a price string between currencies at the sell rate (SYP rounded to whole pounds, USD to cents). */
function convert(value: string, to: "USD" | "SYP", sellRate: number): string {
  const n = Number(value)
  if (!value || !Number.isFinite(n) || n <= 0) return value
  return to === "SYP" ? String(Math.round(n * sellRate)) : (Math.round((n / sellRate) * 100) / 100).toString()
}

export function OrderForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const createOrder = useCreateOrder()
  const rate = useCurrentRate()
  // The header reads the same rate query; wait for hydration so the first render matches the server.
  const hydrated = useHydrated()
  const sellRate = hydrated ? (rate.data?.current?.sellRate ?? null) : null
  const [formError, setFormError] = useState<{ message: string; kind: "server" | "fields" } | null>(null)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: emptyOrderForm,
    mode: "onTouched",
  })
  useUnsavedChangesWarning(form.formState.isDirty && !createOrder.isPending)
  const hasFieldErrors = Object.keys(form.formState.errors).length > 0
  const visibleError = formError && (formError.kind === "server" || hasFieldErrors) ? formError.message : null

  // Switching currency converts the prices already typed, so the order keeps its value.
  const onCurrencyChange = (next: "USD" | "SYP") => {
    const previous = form.getValues("currency")
    form.setValue("currency", next, { shouldDirty: true })
    if (previous === next || !sellRate) return
    form.getValues("items").forEach((line, index) =>
      form.setValue(`items.${index}.unitPrice`, convert(line.unitPrice, next, sellRate), { shouldDirty: true }),
    )
    const fee = form.getValues("deliveryFeeCharged")
    if (fee) form.setValue("deliveryFeeCharged", convert(fee, next, sellRate), { shouldDirty: true })
  }

  const onSubmit = form.handleSubmit(
    async (values) => {
      setFormError(null)
      try {
        const order = await createOrder.mutateAsync(toOrderInput(values))
        form.reset(values)
        toast.success(`سُجّل الطلب ${order.orderNumber} ونقصت الكميات من المخزون.`)
        router.replace(`/sales/orders/${order.id}`)
      } catch (error) {
        if (error instanceof ApiError && error.code === "INSUFFICIENT_STOCK") {
          void queryClient.invalidateQueries({ queryKey: stockKeys.all })
        }
        if (!applyApiError(error, form.setError, { mapField: mapOrderField, codeToField: COMPANY_CODES })) {
          setFormError({ message: toUserMessage(error), kind: "server" })
        }
      }
    },
    () => setFormError({ message: "تحقّق من الحقول المعلّمة بالأحمر.", kind: "fields" }),
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate aria-busy={createOrder.isPending} className="flex flex-col gap-6">
        <FormPageHeader
          title="طلب جديد"
          backHref="/sales/orders"
          backLabel="الطلبات"
          actions={
            <>
              <ButtonLink variant="outline" href="/sales/orders">
                إلغاء
              </ButtonLink>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                تسجيل الطلب
              </Button>
            </>
          }
        />
        {visibleError ? <Alert>{visibleError}</Alert> : null}
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <CustomerCard />
            <LinesCard sellRate={sellRate} />
          </div>
          <div className="flex flex-col gap-6">
            <SummaryCard sellRate={sellRate} onCurrencyChange={onCurrencyChange} />
            <DeliveryCard />
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

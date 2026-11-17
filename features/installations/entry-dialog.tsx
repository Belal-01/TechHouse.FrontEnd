"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormDialog } from "@/components/common/form-dialog"
import { MoneyAmount } from "@/components/common/money-amount"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { useCashAccounts } from "@/features/finance"
import { toUserMessage } from "@/lib/api/errors"
import { fieldA11y } from "@/lib/field-a11y"
import { useWriteInstallation } from "./api"

const number = z.string().trim().regex(/^\d{1,15}(\.\d{1,4})?$/, "أدخل رقماً حتى أربع خانات عشرية.")
const positive = number.refine((value) => Number(value) > 0, "أدخل مبلغاً أو كمية أكبر من صفر.")
const account = z.string().min(1, "اختر الصندوق.")
const name = z.string().trim().min(1, "هذا الحقل مطلوب.").max(255, "255 حرفاً كحد أقصى.")
const base = { date: z.iso.date({ error: "أدخل التاريخ." }) }
const purchase = z.object({ ...base, name, quantity: positive, costUsd: positive, accountId: account })
const record = z.object({
  ...base, name, technician: z.string().trim().max(255, "255 حرفاً كحد أقصى."),
  receivedUsd: positive, materialsUsd: number, technicianUsd: number,
  accountId: account, technicianAccountId: z.string(),
}).refine((entry) => Number(entry.technicianUsd) === 0 || entry.technicianAccountId !== "", {
  path: ["technicianAccountId"], message: "اختر صندوق دفع أجرة الفني.",
})
const schema = z.discriminatedUnion("kind", [
  purchase.extend({ kind: z.literal("purchase") }),
  record.extend({ kind: z.literal("record") }),
])

type Entry = z.infer<typeof schema>
type NumericField = "quantity" | "costUsd" | "receivedUsd" | "materialsUsd" | "technicianUsd"

export function EntryDialog({ kind, onClose }: { kind: Entry["kind"]; onClose: () => void }) {
  const accounts = useCashAccounts()
  const defaultBox = accounts.data?.find((item) => item.isDefault && item.active)?.id ?? ""
  const [id] = useState(() => crypto.randomUUID())
  const save = useWriteInstallation()
  const form = useForm<Entry>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind, date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Damascus", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
      name: "", quantity: "", costUsd: "", receivedUsd: "", materialsUsd: "0", technicianUsd: "0",
      technician: "", accountId: defaultBox, technicianAccountId: defaultBox,
    },
  })
  const { register, control, formState: { errors } } = form
  const [received, materials, technician] = useWatch({ control, name: ["receivedUsd", "materialsUsd", "technicianUsd"] })
  const amountFields: { name: NumericField; label: string }[] = kind === "purchase"
    ? [{ name: "quantity", label: "الكمية" }, { name: "costUsd", label: "التكلفة الإجمالية بالدولار" }]
    : [
        { name: "receivedUsd", label: "المبلغ المقبوض بالدولار" },
        { name: "materialsUsd", label: "تكلفة المواد المقدّرة بالدولار" },
        { name: "technicianUsd", label: "أجرة الفني المدفوعة بالدولار" },
      ]

  const accountField = (field: "accountId" | "technicianAccountId", label: string) => {
    const { error } = form.getFieldState(field, form.formState)
    return (
      <FormField id={field} label={label} error={error?.message}>
        <select id={field} className="h-9 w-full rounded-md border border-input bg-background px-2"
          {...register(field)} {...fieldA11y(field, error)}>
          <option value="">اختر الصندوق</option>
          {accounts.data?.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </FormField>
    )
  }

  const submit = form.handleSubmit((values) => {
    if (values.kind === "purchase") {
      const { name, accountId, date } = values
      save.mutate({ kind: "purchase", data: { id, name, accountId, date, quantity: Number(values.quantity), costUsd: Number(values.costUsd) } },
        { onSuccess: onClose })
    } else {
      save.mutate({ kind: "record", data: {
        id, customer: values.name, technician: values.technician, date: values.date,
        receiptAccountId: values.accountId, technicianAccountId: values.technicianAccountId || null,
        receivedUsd: Number(values.receivedUsd), materialsUsd: Number(values.materialsUsd), technicianUsd: Number(values.technicianUsd),
      } }, { onSuccess: onClose })
    }
  })

  return (
    <FormDialog open onOpenChange={(open) => { if (!open) onClose() }}
      title={kind === "purchase" ? "تسجيل شراء مواد" : "تسجيل تركيب"} submitLabel="حفظ" cancelLabel="رجوع"
      onSubmit={submit} isPending={save.isPending} error={save.isError ? toUserMessage(save.error) : null}>
      <FormField id="name" label={kind === "purchase" ? "اسم المادة" : "اسم الزبون"} error={errors.name?.message}>
        <Input id="name" {...register("name")} {...fieldA11y("name", errors.name)} />
      </FormField>
      <FormField id="date" label="التاريخ" error={errors.date?.message}>
        <Input id="date" type="date" {...register("date")} {...fieldA11y("date", errors.date)} />
      </FormField>
      {kind === "record" ? (
        <FormField id="technician" label="اسم الفني (اختياري)" error={form.getFieldState("technician", form.formState).error?.message}>
          <Input id="technician" {...register("technician")} />
        </FormField>
      ) : null}
      {amountFields.map(({ name, label }) => {
        const { error } = form.getFieldState(name, form.formState)
        return (
          <FormField key={name} id={name} label={label} error={error?.message}>
            <Input id={name} inputMode="decimal" dir="ltr" {...register(name)} {...fieldA11y(name, error)} />
          </FormField>
        )
      })}
      {accountField("accountId", kind === "purchase" ? "صندوق دفع المواد" : "صندوق قبض الزبون")}
      {kind === "record" && Number(technician) > 0 ? accountField("technicianAccountId", "صندوق دفع أجرة الفني") : null}
      {kind === "record" ? (
        <p className="small">الربح التقديري <MoneyAmount value={(Number(received) || 0) - (Number(materials) || 0) - (Number(technician) || 0)} currency="USD" /></p>
      ) : null}
    </FormDialog>
  )
}

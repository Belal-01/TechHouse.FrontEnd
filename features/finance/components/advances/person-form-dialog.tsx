"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { fieldA11y } from "@/lib/field-a11y"
import { useCreatePerson, useUpdatePerson } from "../../api/people"
import { personSchema, type PersonFormValues } from "../../schemas/advance.schema"
import type { Person } from "../../types"
import { useMoneyDialogSubmit } from "../cash/use-money-dialog"

type PersonFormDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; person: Person | null }

export function PersonFormDialog({ open, onOpenChange, person }: PersonFormDialogProps) {
  const create = useCreatePerson()
  const update = useUpdatePerson()
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: { name: person?.name ?? "", phone: person?.phone ?? "", active: person?.active ?? true },
  })
  const { register, control, formState: { errors } } = form
  const { formError, run } = useMoneyDialogSubmit(form.setError, () => onOpenChange(false), { PERSON_NAME_EXISTS: "name" })
  const onSubmit = form.handleSubmit((v) => {
    const input = { name: v.name.trim(), phone: v.phone.trim() || null, active: v.active }
    return person
      ? run(() => update.mutateAsync({ id: person.id, ...input, version: person.version }), "تم الحفظ")
      : run(() => create.mutateAsync(input), "تمت الإضافة")
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={person ? "تعديل الشخص" : "إضافة شخص"}
      description="مدير أو موظف قد يأخذ مبلغاً من الصندوق كسلفة."
      submitLabel={person ? "حفظ" : "إضافة"}
      cancelLabel="إلغاء"
      onSubmit={onSubmit}
      isPending={create.isPending || update.isPending}
      error={formError}
    >
      <FormField id="person-name" label="الاسم" error={errors.name?.message}>
        <Input id="person-name" autoComplete="off" maxLength={255} {...fieldA11y("person-name", errors.name)} {...register("name")} />
      </FormField>
      <FormField id="person-phone" label="الهاتف" description="اختياري." error={errors.phone?.message}>
        <Input id="person-phone" type="tel" dir="ltr" className="text-end" maxLength={50} {...fieldA11y("person-phone", errors.phone)} {...register("phone")} />
      </FormField>
      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="person-active">فعّال</Label>
            <Switch id="person-active" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </FormDialog>
  )
}

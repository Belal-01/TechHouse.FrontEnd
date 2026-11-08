"use client"

import { useState } from "react"
import { Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { FormPageHeader } from "@/components/common/form-page-header"
import { RowActions } from "@/components/common/row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/api/errors"
import { useDeleteExpenseCategory, useExpenseCategories } from "../../api/expenses"
import type { ExpenseCategory } from "../../types"
import { CategoryFormDialog } from "./category-form-dialog"

type DialogState = { open: boolean; category: ExpenseCategory | null; session: number }
const closed: DialogState = { open: false, category: null, session: 0 }

export function ExpenseCategoriesView() {
  const categories = useExpenseCategories()
  const remove = useDeleteExpenseCategory()
  const [form, setForm] = useState<DialogState>(closed)
  const [removal, setRemoval] = useState<DialogState>(closed)
  const [removeError, setRemoveError] = useState<string | null>(null)

  const columns: DataTableColumn<ExpenseCategory>[] = [
    {
      id: "name",
      header: "الفئة",
      cell: (c) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{c.name}</span>
          {c.system ? <Badge variant="secondary">يستخدمها النظام</Badge> : null}
        </span>
      ),
    },
    {
      id: "status",
      header: "الحالة",
      cell: (c) => (c.active ? <Badge variant="info">فعّالة</Badge> : <Badge variant="outline">غير فعّالة</Badge>),
    },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (c) => (
        <RowActions
          label={`إجراءات ${c.name}`}
          actions={[
            { label: "تعديل", icon: Pencil, onSelect: () => setForm((s) => ({ open: true, category: c, session: s.session + 1 })) },
            ...(c.system
              ? []
              : [
                  {
                    label: "حذف",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onSelect: () => {
                      setRemoveError(null)
                      setRemoval((s) => ({ open: true, category: c, session: s.session + 1 }))
                    },
                  },
                ]),
          ]}
        />
      ),
    },
  ]

  const confirmRemove = async () => {
    if (!removal.category) return
    try {
      await remove.mutateAsync(removal.category.id)
      toast.success("تم حذف الفئة")
      setRemoval((s) => ({ ...s, open: false }))
    } catch (error) {
      setRemoveError(toUserMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FormPageHeader
        title="فئات المصاريف"
        backHref="/finance/expenses"
        backLabel="المصاريف"
        actions={
          <Button onClick={() => setForm((s) => ({ open: true, category: null, session: s.session + 1 }))}>
            <Plus aria-hidden />
            إضافة فئة
          </Button>
        }
      />
      <DataTable
        caption="فئات المصاريف"
        columns={columns}
        rows={categories.data}
        getRowId={(c) => c.id}
        isLoading={categories.isPending}
        error={categories.isError ? toUserMessage(categories.error) : null}
        onRetry={() => categories.refetch()}
        empty={<EmptyState icon={Tags} title="لا توجد فئات" />}
      />
      <CategoryFormDialog
        key={`form-${form.session}`}
        open={form.open}
        onOpenChange={(open) => setForm((s) => ({ ...s, open }))}
        category={form.category}
      />
      <ConfirmDialog
        key={`remove-${removal.session}`}
        open={removal.open}
        onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
        title={`حذف الفئة «${removal.category?.name ?? ""}»؟`}
        description="الفئة التي لها مصاريف لا تُحذف، بل يمكنك تعطيلها."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={confirmRemove}
        isPending={remove.isPending}
        error={removeError}
      />
    </div>
  )
}

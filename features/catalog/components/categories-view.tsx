"use client"

import { useState } from "react"
import { Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { RowActions } from "@/components/common/row-actions"
import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/api/errors"
import { formatDate } from "@/lib/format"
import { useCategories } from "../api/categories"
import type { Category } from "../types"
import { CategoryFormDialog } from "./category-form-dialog"
import { DeleteCategoryDialog } from "./delete-category-dialog"

// Dialog targets stay set while a dialog closes so its text doesn't flash during the exit animation;
// `session` changes on every open so each opening remounts with a fresh form and no stale error.
type DialogState = { open: boolean; category: Category | null; session: number }

const closed: DialogState = { open: false, category: null, session: 0 }

export function CategoriesView() {
  const categories = useCategories()
  const [form, setForm] = useState<DialogState>(closed)
  const [removal, setRemoval] = useState<DialogState>(closed)

  const openForm = (category: Category | null) =>
    setForm((s) => ({ open: true, category, session: s.session + 1 }))
  const openRemoval = (category: Category) =>
    setRemoval((s) => ({ open: true, category, session: s.session + 1 }))

  const columns: DataTableColumn<Category>[] = [
    {
      id: "name",
      header: "الاسم",
      cell: (category) => <span className="font-semibold text-foreground">{category.name}</span>,
    },
    {
      id: "createdAt",
      header: "تاريخ الإضافة",
      className: "hidden text-muted-foreground sm:table-cell",
      cell: (category) => formatDate(category.createdAt),
    },
    {
      id: "updatedAt",
      header: "آخر تعديل",
      className: "hidden text-muted-foreground md:table-cell",
      cell: (category) => formatDate(category.updatedAt),
    },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (category) => (
        <RowActions
          label={`إجراءات ${category.name}`}
          actions={[
            { label: "تعديل", icon: Pencil, onSelect: () => openForm(category) },
            { label: "حذف", icon: Trash2, variant: "destructive", onSelect: () => openRemoval(category) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="التصنيفات"
        description="نظّم منتجاتك في تصنيفات لتسهيل البحث والتقارير."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus aria-hidden />
            إضافة تصنيف
          </Button>
        }
      />

      <DataTable
        caption="قائمة التصنيفات"
        columns={columns}
        rows={categories.data}
        getRowId={(category) => category.id}
        isLoading={categories.isPending}
        error={categories.isError ? toUserMessage(categories.error) : null}
        onRetry={() => categories.refetch()}
        empty={
          <EmptyState
            icon={Tags}
            title="لا توجد تصنيفات بعد"
            description="أضف أول تصنيف لتبدأ بتنظيم منتجاتك."
            action={
              <Button variant="outline" onClick={() => openForm(null)}>
                <Plus aria-hidden />
                إضافة تصنيف
              </Button>
            }
          />
        }
      />

      <CategoryFormDialog
        key={`form-${form.session}`}
        open={form.open}
        onOpenChange={(open) => setForm((s) => ({ ...s, open }))}
        category={form.category}
      />
      <DeleteCategoryDialog
        key={`delete-${removal.session}`}
        open={removal.open}
        onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
        category={removal.category}
      />
    </div>
  )
}

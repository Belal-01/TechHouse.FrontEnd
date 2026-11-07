"use client"

import { useState } from "react"
import { Pencil, Plus, SearchX, Trash2, Truck } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { RowActions } from "@/components/common/row-actions"
import { SearchInput } from "@/components/common/search-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { toUserMessage } from "@/lib/api/errors"
import { useSuppliers } from "../api/suppliers"
import type { Supplier } from "../types"
import { DeleteSupplierDialog } from "./delete-supplier-dialog"
import { SupplierFormDialog } from "./supplier-form-dialog"

// Same dialog pattern as categories: `session` remounts each opening with a fresh form.
type DialogState = { open: boolean; supplier: Supplier | null; session: number }
const closed: DialogState = { open: false, supplier: null, session: 0 }

export function SuppliersView() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const suppliers = useSuppliers({ search: debouncedSearch, active: null })
  const [form, setForm] = useState<DialogState>(closed)
  const [removal, setRemoval] = useState<DialogState>(closed)

  const openForm = (supplier: Supplier | null) => setForm((s) => ({ open: true, supplier, session: s.session + 1 }))

  const columns: DataTableColumn<Supplier>[] = [
    {
      id: "name",
      header: "المورد",
      cell: (supplier) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-foreground">{supplier.name}</span>
          {supplier.contactInfo ? (
            <span className="truncate text-xs text-muted-foreground">{supplier.contactInfo}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "notes",
      header: "ملاحظات",
      className: "hidden max-w-xs truncate text-muted-foreground md:table-cell",
      cell: (supplier) => supplier.notes ?? "—",
    },
    {
      id: "status",
      header: "الحالة",
      cell: (supplier) =>
        supplier.active ? <Badge variant="info">فعّال</Badge> : <Badge variant="outline">غير فعّال</Badge>,
    },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (supplier) => (
        <RowActions
          label={`إجراءات ${supplier.name}`}
          actions={[
            { label: "تعديل", icon: Pencil, onSelect: () => openForm(supplier) },
            {
              label: "حذف",
              icon: Trash2,
              variant: "destructive",
              onSelect: () => setRemoval((s) => ({ open: true, supplier, session: s.session + 1 })),
            },
          ]}
        />
      ),
    },
  ]

  const addButton = (variant: "default" | "outline") => (
    <Button variant={variant} onClick={() => openForm(null)}>
      <Plus aria-hidden />
      إضافة مورد
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="الموردون" description="الجهات التي تشتري منها البضاعة." actions={addButton("default")} />

      <SearchInput
        label="بحث في الموردين"
        placeholder="ابحث باسم المورد"
        value={search}
        onValueChange={setSearch}
        className="md:max-w-sm"
      />

      <DataTable
        caption="قائمة الموردين"
        columns={columns}
        rows={suppliers.data}
        getRowId={(supplier) => supplier.id}
        isLoading={suppliers.isPending}
        error={suppliers.isError ? toUserMessage(suppliers.error) : null}
        onRetry={() => suppliers.refetch()}
        className={suppliers.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
        empty={
          search ? (
            <EmptyState icon={SearchX} title="لا توجد نتائج" description="لا يوجد مورد بهذا الاسم." />
          ) : (
            <EmptyState
              icon={Truck}
              title="لا يوجد موردون بعد"
              description="أضف الموردين لتربط بهم فواتير الشراء."
              action={addButton("outline")}
            />
          )
        }
      />

      <SupplierFormDialog
        key={`form-${form.session}`}
        open={form.open}
        onOpenChange={(open) => setForm((s) => ({ ...s, open }))}
        supplier={form.supplier}
      />
      <DeleteSupplierDialog
        key={`delete-${removal.session}`}
        open={removal.open}
        onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
        supplier={removal.supplier}
      />
    </div>
  )
}

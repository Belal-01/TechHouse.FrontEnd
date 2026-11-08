"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2, Truck } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { RowActions } from "@/components/common/row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/api/errors"
import { useDeliveryCompanies } from "../api/delivery-companies"
import type { DeliveryCompany } from "../types"
import { DeleteDeliveryCompanyDialog } from "./delete-delivery-company-dialog"
import { DeliveryCompanyFormDialog } from "./delivery-company-form-dialog"

type DialogState = { open: boolean; company: DeliveryCompany | null; session: number }
const closed: DialogState = { open: false, company: null, session: 0 }

export function DeliveryCompaniesView() {
  const companies = useDeliveryCompanies()
  const [form, setForm] = useState<DialogState>(closed)
  const [removal, setRemoval] = useState<DialogState>(closed)
  const openForm = (company: DeliveryCompany | null) => setForm((s) => ({ open: true, company, session: s.session + 1 }))

  const columns: DataTableColumn<DeliveryCompany>[] = [
    {
      id: "name",
      header: "الشركة",
      cell: (company) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-foreground">{company.name}</span>
          {company.contactInfo ? <span className="truncate text-xs text-muted-foreground">{company.contactInfo}</span> : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "الحالة",
      cell: (company) => (company.active ? <Badge variant="info">فعّالة</Badge> : <Badge variant="outline">غير فعّالة</Badge>),
    },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (company) => (
        <RowActions
          label={`إجراءات ${company.name}`}
          actions={[
            { label: "تعديل", icon: Pencil, onSelect: () => openForm(company) },
            {
              label: "حذف",
              icon: Trash2,
              variant: "destructive",
              onSelect: () => setRemoval((s) => ({ open: true, company, session: s.session + 1 })),
            },
          ]}
        />
      ),
    },
  ]

  const addButton = (variant: "default" | "outline") => (
    <Button variant={variant} onClick={() => openForm(null)}>
      <Plus aria-hidden />
      إضافة شركة
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="شركات التوصيل" description="الشركات التي تسلّمها الطرود. أجرتها تُسجَّل مصروفاً على كل طلب." actions={addButton("default")} />
      <DataTable
        caption="قائمة شركات التوصيل"
        columns={columns}
        rows={companies.data}
        getRowId={(company) => company.id}
        isLoading={companies.isPending}
        error={companies.isError ? toUserMessage(companies.error) : null}
        onRetry={() => companies.refetch()}
        empty={<EmptyState icon={Truck} title="لا توجد شركات توصيل بعد" description="أضف الشركات التي تتعامل معها لتختارها في الطلبات." action={addButton("outline")} />}
      />
      <DeliveryCompanyFormDialog
        key={`form-${form.session}`}
        open={form.open}
        onOpenChange={(open) => setForm((s) => ({ ...s, open }))}
        company={form.company}
      />
      <DeleteDeliveryCompanyDialog
        key={`delete-${removal.session}`}
        open={removal.open}
        onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
        company={removal.company}
      />
    </div>
  )
}

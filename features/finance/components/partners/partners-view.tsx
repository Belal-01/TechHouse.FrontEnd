"use client"

import Link from "next/link"
import { useState } from "react"
import { Handshake, Pencil, Plus } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { RowActions } from "@/components/common/row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/api/errors"
import { formatMoney, formatQuantity } from "@/lib/format"
import { usePartners } from "../../api/partners"
import { PARTNER_KIND_LABELS } from "../../lib/partner-labels"
import type { Partner } from "../../types"
import { PartnerFormDialog } from "./partner-form-dialog"

export function PartnersView() {
  const partners = usePartners()
  const [form, setForm] = useState<{ open: boolean; partner: Partner | null; session: number }>({ open: false, partner: null, session: 0 })
  const openForm = (partner: Partner | null) => setForm((s) => ({ open: true, partner, session: s.session + 1 }))

  const columns: DataTableColumn<Partner>[] = [
    {
      id: "name",
      header: "الاسم",
      cell: (p) => (
        <div className="flex flex-col items-start gap-1">
          <Link href={`/finance/advances/${p.advanceProfileId}`} className="font-semibold text-foreground hover:text-blue hover:underline">{p.name}</Link>
          {p.active ? null : <Badge variant="outline">غير فعّال</Badge>}
        </div>
      ),
    },
    {
      id: "kind",
      header: "النوع",
      cell: (p) => <Badge variant={p.kind === "OWNER" ? "info" : "secondary"}>{PARTNER_KIND_LABELS[p.kind]}</Badge>,
    },
    {
      id: "percent",
      header: "النسبة",
      className: "hidden sm:table-cell",
      cell: (p) => (
        <span className="small">
          <span dir="ltr">{p.profitPercent}%</span> {p.kind === "OWNER" ? "من الشركة" : "من الربح"}
        </span>
      ),
    },
    {
      id: "funded",
      header: "دفع في الفواتير",
      align: "end",
      cell: (p) => (
        <div className="flex flex-col items-end">
          <span dir="ltr" className="font-semibold">
            {formatMoney(p.fundedUsd)}
          </span>
          <span className="text-xs text-muted-foreground">{formatQuantity(p.invoiceCount)} فاتورة</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (p) => <RowActions label={`إجراءات ${p.name}`} actions={[{ label: "تعديل", icon: Pencil, onSelect: () => openForm(p) }]} />,
    },
  ]

  const addButton = (variant: "default" | "outline") => (
    <Button variant={variant} onClick={() => openForm(null)}>
      <Plus aria-hidden />
      إضافة
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الشركاء والمستثمرون"
        description="أصحاب الشركة، والمستثمرون الذين يموّلون فواتير معيّنة. عند تسجيل فاتورة تختار من دفع كل جزء منها."
        actions={addButton("default")}
      />
      <DataTable
        caption="الشركاء والمستثمرون"
        columns={columns}
        rows={partners.data}
        getRowId={(p) => p.id}
        isLoading={partners.isPending}
        error={partners.isError ? toUserMessage(partners.error) : null}
        onRetry={() => partners.refetch()}
        empty={
          <EmptyState
            icon={Handshake}
            title="لم تُضف أحداً بعد"
            description="أضف صاحبَي الشركة، وأي مستثمر يموّل فاتورة."
            action={addButton("outline")}
          />
        }
      />
      <PartnerFormDialog key={form.session} open={form.open} onOpenChange={(open) => setForm((s) => ({ ...s, open }))} partner={form.partner} />
    </div>
  )
}

"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { MoneyAmount } from "@/components/common/money-amount"
import { PageHeader } from "@/components/common/page-header"
import { StatTile } from "@/components/common/stat-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { toUserMessage } from "@/lib/api/errors"
import { formatDate } from "@/lib/format"
import { useInstallations, useWriteInstallation, type Installation, type Material } from "./api"
import { EntryDialog } from "./entry-dialog"

const usd = (value: number) => <MoneyAmount value={value} currency="USD" />

const jobs: DataTableColumn<Installation>[] = [
  { id: "customer", header: "التركيب", className: "whitespace-normal", cell: (job) => (
    <div className="flex flex-col">
      <span>{job.customer}</span>
      <span className="small text-muted-foreground">{formatDate(job.date)}</span>
      {job.technician ? <span className="small text-muted-foreground">{job.technician}</span> : null}
    </div>
  ) },
  { id: "amounts", header: "المبالغ", cell: (job) => (
    <div className="flex flex-col small">
      <span>قبض {usd(job.receivedUsd)}</span>
      <span>مواد {usd(job.materialsUsd)}</span>
      <span>فني {usd(job.technicianUsd)}</span>
    </div>
  ) },
  { id: "profit", header: "الربح التقديري", cell: (job) => usd(job.profitUsd) },
]

export function InstallationsView() {
  const query = useInstallations()
  const mark = useWriteInstallation()
  const [dialog, setDialog] = useState<"purchase" | "record" | null>(null)
  const data = query.data

  const materials: DataTableColumn<Material>[] = [
    { id: "name", header: "المادة", className: "whitespace-normal", cell: (row) => (
      <div className="flex flex-col">
        <span>{row.name}</span>
        <span className="small text-muted-foreground">{row.quantity} · {formatDate(row.date)}</span>
      </div>
    ) },
    { id: "cost", header: "التكلفة", cell: (row) => usd(row.costUsd) },
    { id: "status", header: "الحالة", cell: (row) => row.depleted ? <Badge variant="secondary">نفدت</Badge> : (
      <Button variant="outline" size="sm" disabled={mark.isPending} onClick={() => mark.mutate({ kind: "deplete", id: row.id })}>
        تسجيل النفاد
      </Button>
    ) },
  ]

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="تركيب نقاط الشحن" actions={<Button onClick={() => setDialog("record")}>تسجيل تركيب</Button>} />
      {query.isError ? <Alert>{toUserMessage(query.error)} <Button variant="outline" onClick={() => query.refetch()}>إعادة المحاولة</Button></Alert> : null}
      {data ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="إجمالي تكلفة المواد" value={usd(data.costUsd)} />
          <StatTile label="تكلفة المواد المغطّاة" value={usd(data.coveredUsd)} />
          <StatTile label="تكلفة المواد غير المغطّاة" value={usd(data.uncoveredUsd)} />
        </div>
      ) : null}
      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="h3">مواد التركيب</h2>
          <Button variant="outline" onClick={() => setDialog("purchase")}>تسجيل شراء مواد</Button>
        </div>
        {mark.isError ? <Alert>{toUserMessage(mark.error)}</Alert> : null}
        <DataTable caption="مواد التركيب" columns={materials} rows={data?.materials} getRowId={(row) => row.id}
          isLoading={query.isPending} empty="لا توجد مشتريات مواد." />
      </section>
      <section className="grid gap-3">
        <h2 className="h3">عمليات التركيب</h2>
        <DataTable caption="عمليات التركيب" columns={jobs} rows={data?.installations} getRowId={(row) => row.id}
          isLoading={query.isPending} empty="لا توجد عمليات تركيب." />
      </section>
      {dialog ? <EntryDialog kind={dialog} onClose={() => setDialog(null)} /> : null}
    </div>
  )
}

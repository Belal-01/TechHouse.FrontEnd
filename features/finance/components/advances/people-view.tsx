"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HandCoins, Pencil, Plus, UserRound } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { MoneyAmount } from "@/components/common/money-amount"
import { PageHeader } from "@/components/common/page-header"
import { RowActions } from "@/components/common/row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"
import { usePeople } from "../../api/people"
import type { Person } from "../../types"
import { PersonFormDialog } from "./person-form-dialog"

const owed = (value: number, currency: "USD" | "SYP") =>
  value === 0 ? <span className="text-muted-foreground">—</span> : <MoneyAmount value={value} currency={currency} className={cn("font-semibold", value > 0 && "text-red")} />

export function PeopleView() {
  const router = useRouter()
  const people = usePeople()
  const [form, setForm] = useState<{ open: boolean; person: Person | null; session: number }>({ open: false, person: null, session: 0 })
  const openForm = (person: Person | null) => setForm((s) => ({ open: true, person, session: s.session + 1 }))

  const columns: DataTableColumn<Person>[] = [
    {
      id: "name",
      header: "الشخص",
      cell: (p) => (
        <div className="flex flex-col">
          <Link href={`/finance/advances/${p.id}`} className="w-fit font-semibold text-foreground hover:text-blue hover:underline">
            {p.name}
          </Link>
          {p.active ? null : <Badge variant="outline">غير فعّال</Badge>}
        </div>
      ),
    },
    { id: "usd", header: "عليه بالدولار", cell: (p) => owed(p.owedUsd, "USD") },
    { id: "syp", header: "عليه بالليرة", cell: (p) => owed(p.owedSyp, "SYP") },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (p) => (
        <RowActions
          label={`إجراءات ${p.name}`}
          actions={[
            { label: "السلف والحركات", icon: HandCoins, onSelect: () => router.push(`/finance/advances/${p.id}`) },
            { label: "تعديل", icon: Pencil, onSelect: () => openForm(p) },
          ]}
        />
      ),
    },
  ]

  const addButton = (variant: "default" | "outline") => (
    <Button variant={variant} onClick={() => openForm(null)}>
      <Plus aria-hidden />
      إضافة شخص
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="السلف"
        description="مبالغ أخذها مدراء أو موظفون من الصندوق. تبقى مالاً للمتجر عليهم حتى تُعاد، ولا تُحتسب مصروفاً."
        actions={addButton("default")}
      />
      <DataTable
        caption="الأشخاص وما عليهم"
        columns={columns}
        rows={people.data}
        getRowId={(p) => p.id}
        isLoading={people.isPending}
        error={people.isError ? toUserMessage(people.error) : null}
        onRetry={() => people.refetch()}
        empty={<EmptyState icon={UserRound} title="لا يوجد أشخاص بعد" description="أضف المدراء الذين قد يسحبون من الصندوق." action={addButton("outline")} />}
      />
      <PersonFormDialog key={form.session} open={form.open} onOpenChange={(open) => setForm((s) => ({ ...s, open }))} person={form.person} />
    </div>
  )
}

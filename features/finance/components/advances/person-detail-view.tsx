"use client"

import { useState } from "react"
import Link from "next/link"
import { HandCoins, ShoppingBag, Undo2, UserX } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { FormPageHeader } from "@/components/common/form-page-header"
import { MoneyAmount } from "@/components/common/money-amount"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, toUserMessage } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCashAccounts } from "../../api/cash"
import { useAdvanceEntries, usePerson } from "../../api/people"
import type { AdvanceEntry } from "../../types"
import { AdvanceCashDialog } from "./advance-cash-dialog"
import { SpendDialog } from "./spend-dialog"

const KIND_LABELS = { WITHDRAWAL: "سحب", RETURN: "إعادة", EXPENSE: "صُرف على المتجر" } as const

const columns: DataTableColumn<AdvanceEntry>[] = [
  {
    id: "what",
    header: "الحركة",
    className: "whitespace-normal!",
    cell: (e) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-foreground">{KIND_LABELS[e.kind]}</span>
        {e.account ? <span className="small text-muted-foreground">{e.kind === "WITHDRAWAL" ? "من" : "إلى"} {e.account.name}</span> : null}
        {e.note ? <span className="small">{e.note}</span> : null}
        {e.expenseId ? (
          <Link href="/finance/expenses" className="w-fit small text-blue hover:underline">
            في المصاريف
          </Link>
        ) : null}
        <span className="text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</span>
      </div>
    ),
  },
  {
    id: "amount",
    header: "على الشخص",
    align: "end",
    cell: (e) => <MoneyAmount value={e.amount} currency={e.currency} className={cn("font-semibold", e.amount > 0 ? "text-red" : "text-foreground")} />,
  },
]

type Dialog = { kind: "withdraw" | "return" | "spend" | null; session: number }

export function PersonDetailView({ personId }: { personId: string }) {
  const person = usePerson(personId)
  const entries = useAdvanceEntries(personId)
  const accounts = useCashAccounts()
  const [dialog, setDialog] = useState<Dialog>({ kind: null, session: 0 })
  const open = (kind: NonNullable<Dialog["kind"]>) => setDialog((s) => ({ kind, session: s.session + 1 }))
  const onOpenChange = (isOpen: boolean) => setDialog((s) => ({ ...s, kind: isOpen ? s.kind : null }))

  if (person.isPending) return <Skeleton className="h-64 w-full" />
  if (person.isError) {
    if (person.error instanceof ApiError && person.error.status === 404) {
      return <EmptyState icon={UserX} title="الشخص غير موجود" action={<ButtonLink variant="outline" href="/finance/advances">العودة إلى السلف</ButtonLink>} />
    }
    return <Alert>{toUserMessage(person.error)}</Alert>
  }

  const p = person.data
  const owesAnything = p.owedUsd > 0 || p.owedSyp > 0
  const defaultAccountId = accounts.data?.find((a) => a.isDefault)?.id ?? ""

  return (
    <div className="flex flex-col gap-6">
      <FormPageHeader
        title={p.name}
        backHref="/finance/advances"
        backLabel="السلف"
        actions={
          <>
            <Button variant="outline" onClick={() => open("spend")} disabled={!owesAnything}>
              <ShoppingBag aria-hidden />
              صُرف على المتجر
            </Button>
            <Button variant="outline" onClick={() => open("return")} disabled={!owesAnything}>
              <Undo2 aria-hidden />
              إعادة
            </Button>
            <Button onClick={() => open("withdraw")} disabled={!p.active || !accounts.data}>
              <HandCoins aria-hidden />
              سحب سلفة
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {(["USD", "SYP"] as const).map((currency) => {
          const value = currency === "USD" ? p.owedUsd : p.owedSyp
          return (
            <Card key={currency}>
              <CardContent className="flex flex-col gap-1">
                <span className="small text-muted-foreground">عليه {currency === "USD" ? "بالدولار" : "بالليرة"}</span>
                <MoneyAmount value={value} currency={currency} className={cn("h2", value > 0 ? "text-red" : "text-foreground")} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="advance-history-title">
        <h2 id="advance-history-title" className="h3">
          السجل
        </h2>
        <DataTable
          caption={`حركات سلف ${p.name}`}
          columns={columns}
          rows={entries.data}
          getRowId={(e) => e.id}
          isLoading={entries.isPending}
          error={entries.isError ? toUserMessage(entries.error) : null}
          onRetry={() => entries.refetch()}
          empty={<EmptyState icon={HandCoins} title="لا توجد سلف بعد" />}
        />
      </section>

      {dialog.kind === "withdraw" || dialog.kind === "return" ? (
        <AdvanceCashDialog key={dialog.session} open onOpenChange={onOpenChange} person={p} mode={dialog.kind} defaultAccountId={defaultAccountId} />
      ) : null}
      {dialog.kind === "spend" ? <SpendDialog key={dialog.session} open onOpenChange={onOpenChange} person={p} /> : null}
    </div>
  )
}

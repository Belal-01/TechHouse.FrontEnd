"use client"

import { useState } from "react"
import Link from "next/link"
import { ReceiptText } from "lucide-react"
import { CurrencySelect } from "@/components/common/currency-select"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { MoneyAmount } from "@/components/common/money-amount"
import { PaginationBar } from "@/components/common/pagination-bar"
import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/api/errors"
import type { Currency } from "@/lib/currency"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useMovements } from "../../api/cash"
import { MOVEMENT_LABELS, referenceHref } from "../../lib/labels"
import type { Movement } from "../../types"
import { CashAccountSelect } from "../cash-account-select"

const PAGE_SIZE = 30

const columns: DataTableColumn<Movement>[] = [
  {
    id: "what",
    header: "الحركة",
    className: "whitespace-normal!",
    cell: (m) => {
      const href = m.reference ? referenceHref(m.reference.type, m.reference.id) : null
      const label = m.reference?.label
      return (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-semibold text-foreground">{MOVEMENT_LABELS[m.type]}</span>
          {label ? (
            href ? (
              <Link href={href} className="w-fit small text-blue hover:underline" dir="auto">
                {label}
              </Link>
            ) : (
              <span className="small text-muted-foreground" dir="auto">
                {label}
              </span>
            )
          ) : null}
          {m.note && m.note !== label ? <span className="small text-muted-foreground">{m.note}</span> : null}
          <span className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
        </div>
      )
    },
  },
  { id: "account", header: "الصندوق", className: "hidden sm:table-cell", cell: (m) => m.account.name },
  {
    id: "amount",
    header: "المبلغ",
    align: "end",
    cell: (m) => (
      <MoneyAmount value={m.amount} currency={m.currency} className={cn("font-semibold", m.amount < 0 ? "text-red" : "text-foreground")} />
    ),
  },
]

/** The ledger, newest first, filterable by box and currency. */
export function MovementsTable() {
  const [accountId, setAccountId] = useState("")
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [page, setPage] = useState(0)
  const movements = useMovements({ accountId: accountId || null, currency, page, size: PAGE_SIZE })
  const data = movements.data

  return (
    <section className="flex flex-col gap-3" aria-labelledby="movements-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="movements-title" className="h3">
          سجل الحركات
        </h2>
        <div className="flex flex-wrap gap-2">
          <CashAccountSelect
            aria-label="الصندوق"
            className="w-40"
            emptyLabel="كل الصناديق"
            value={accountId}
            onValueChange={(v) => {
              setAccountId(v)
              setPage(0)
            }}
          />
          {currency ? (
            <CurrencySelect aria-label="العملة" className="w-36" value={currency} onValueChange={(c) => (setCurrency(c), setPage(0))} />
          ) : null}
          <Button variant={currency ? "ghost" : "outline"} onClick={() => (setCurrency(currency ? null : "USD"), setPage(0))}>
            {currency ? "كل العملات" : "حسب العملة"}
          </Button>
        </div>
      </div>
      <DataTable
        caption="سجل حركات الصناديق"
        columns={columns}
        rows={data?.content}
        getRowId={(m) => m.id}
        isLoading={movements.isPending}
        loadingRows={6}
        error={movements.isError ? toUserMessage(movements.error) : null}
        onRetry={() => movements.refetch()}
        className={movements.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
        empty={<EmptyState icon={ReceiptText} title="لا توجد حركات" description="ابدأ بإيداع الرصيد الافتتاحي لكل صندوق." />}
      />
      {data ? (
        <PaginationBar page={data.page} pageSize={data.size} totalElements={data.totalElements} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}
    </section>
  )
}

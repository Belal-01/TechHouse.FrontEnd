"use client"

import { useState } from "react"
import Link from "next/link"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { Ban, Plus, Tags, Wallet } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { MoneyAmount } from "@/components/common/money-amount"
import { PageHeader } from "@/components/common/page-header"
import { PaginationBar } from "@/components/common/pagination-bar"
import { RowActions } from "@/components/common/row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toUserMessage } from "@/lib/api/errors"
import { formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCashAccounts } from "../../api/cash"
import { useExpenses, useExpenseSummary } from "../../api/expenses"
import type { Expense } from "../../types"
import { ExpenseCategorySelect } from "../expense-category-select"
import { ExpenseDialog } from "./expense-dialog"
import { ExpenseSummary } from "./expense-summary"
import { VoidExpenseDialog } from "./void-expense-dialog"

const PAGE_SIZE = 20

/** Only expenses entered on this screen can be voided here (order fees go with their order). */
const canVoid = (e: Expense) => !e.voidedAt && !e.orderId && Boolean(e.account)

export function ExpensesView() {
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"))
  const [categoryId, setCategoryId] = useState("")
  const [page, setPage] = useState(0)
  const [addDialog, setAddDialog] = useState({ open: false, session: 0 })
  const [removal, setRemoval] = useState<{ open: boolean; expense: Expense | null; session: number }>({ open: false, expense: null, session: 0 })

  const first = startOfMonth(new Date(`${month}-01T00:00:00`))
  const from = format(first, "yyyy-MM-dd")
  const to = format(endOfMonth(first), "yyyy-MM-dd")
  const accounts = useCashAccounts()
  const summary = useExpenseSummary(from, to)
  const expenses = useExpenses({ categoryId: categoryId || null, from, to, page, size: PAGE_SIZE })
  const data = expenses.data

  const columns: DataTableColumn<Expense>[] = [
    {
      id: "what",
      header: "المصروف",
      className: "whitespace-normal!",
      cell: (e) => (
        <div className={cn("flex min-w-0 flex-col gap-0.5", e.voidedAt && "opacity-60")}>
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{e.category.name}</span>
            {e.voidedAt ? <Badge variant="outline">ملغى</Badge> : null}
          </span>
          {e.description ? <span className="small">{e.description}</span> : null}
          {e.orderId ? (
            <Link href={`/sales/orders/${e.orderId}`} className="w-fit small text-blue hover:underline">
              عرض الطلب
            </Link>
          ) : null}
          {e.paidBy ? <span className="small text-muted-foreground">من سلفة: {e.paidBy.name}</span> : null}
          <span className="text-xs text-muted-foreground">{formatDate(e.expenseDate)}</span>
        </div>
      ),
    },
    {
      id: "account",
      header: "الدفع من",
      className: "hidden md:table-cell",
      cell: (e) => e.account?.name ?? (e.paidBy ? "سلفة" : "—"),
    },
    {
      id: "amount",
      header: "المبلغ",
      align: "end",
      cell: (e) => (
        <div className={cn("flex flex-col items-end", e.voidedAt && "line-through opacity-60")}>
          <MoneyAmount value={e.amount} currency={e.currency} className="font-semibold" />
          {e.currency === "SYP" ? (
            <span dir="ltr" className="text-xs text-muted-foreground">
              {formatMoney(e.amountUsd)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">إجراءات</span>,
      className: "w-16",
      align: "end",
      cell: (e) =>
        canVoid(e) ? (
          <RowActions
            label={`إجراءات مصروف ${e.category.name}`}
            actions={[
              {
                label: "إلغاء المصروف",
                icon: Ban,
                variant: "destructive",
                onSelect: () => setRemoval((s) => ({ open: true, expense: e, session: s.session + 1 })),
              },
            ]}
          />
        ) : null,
    },
  ]

  const addButton = (variant: "default" | "outline") => (
    <Button variant={variant} onClick={() => setAddDialog((s) => ({ open: true, session: s.session + 1 }))} disabled={!accounts.data}>
      <Plus aria-hidden />
      إضافة مصروف
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المصاريف"
        description="كل ما يُنقص الربح: إعلانات، توصيل، تغليف... بالدولار حسب سعر يوم الإدخال."
        actions={
          <>
            <ButtonLink variant="outline" href="/finance/expense-categories">
              <Tags aria-hidden />
              الفئات
            </ButtonLink>
            {addButton("default")}
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="month"
          aria-label="الشهر"
          dir="ltr"
          className="sm:w-48"
          value={month}
          onChange={(e) => {
            if (e.target.value) setMonth(e.target.value)
            setPage(0)
          }}
        />
        <ExpenseCategorySelect
          aria-label="الفئة"
          className="w-full sm:w-52"
          emptyLabel="كل الفئات"
          value={categoryId}
          onValueChange={(v) => {
            setCategoryId(v)
            setPage(0)
          }}
        />
      </div>

      <ExpenseSummary summary={summary.data} isLoading={summary.isPending} />

      <DataTable
        caption="قائمة المصاريف"
        columns={columns}
        rows={data?.content}
        getRowId={(e) => e.id}
        isLoading={expenses.isPending}
        error={expenses.isError ? toUserMessage(expenses.error) : null}
        onRetry={() => expenses.refetch()}
        className={expenses.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
        empty={<EmptyState icon={Wallet} title="لا توجد مصاريف في هذه الفترة" action={addButton("outline")} />}
      />
      {data ? (
        <PaginationBar page={data.page} pageSize={data.size} totalElements={data.totalElements} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}

      {accounts.data ? (
        <ExpenseDialog
          key={addDialog.session}
          open={addDialog.open}
          onOpenChange={(open) => setAddDialog((s) => ({ ...s, open }))}
          defaultAccountId={accounts.data.find((a) => a.isDefault)?.id ?? ""}
        />
      ) : null}
      <VoidExpenseDialog
        key={`void-${removal.session}`}
        open={removal.open}
        onOpenChange={(open) => setRemoval((s) => ({ ...s, open }))}
        expense={removal.expense}
      />
    </div>
  )
}

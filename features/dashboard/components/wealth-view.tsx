"use client"

import Link from "next/link"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { MoneyAmount } from "@/components/common/money-amount"
import { PageHeader } from "@/components/common/page-header"
import { StatTile } from "@/components/common/stat-tile"
import { SypAmount } from "@/components/common/syp-amount"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toUserMessage } from "@/lib/api/errors"
import { formatMoney, formatQuantity } from "@/lib/format"
import { useWealth } from "../api/dashboard"
import type { Wealth } from "../types"

const usd = (value: number) => <span dir="ltr">{formatMoney(value)}</span>
const share = (part: number, total: number) => (total > 0 ? `${Math.round((part / total) * 100)}%` : "—")

const accountColumns: DataTableColumn<Wealth["accounts"][number]>[] = [
  { id: "name", header: "الصندوق", cell: (a) => <span className="font-semibold text-foreground">{a.name}</span> },
  { id: "usd", header: "دولار", cell: (a) => <MoneyAmount value={a.usd} currency="USD" /> },
  { id: "syp", header: "ليرة", className: "hidden sm:table-cell", cell: (a) => <MoneyAmount value={a.syp} currency="SYP" /> },
  { id: "value", header: "القيمة بالدولار", align: "end", cell: (a) => <span className="font-semibold">{usd(a.valueUsd)}</span> },
]

const incomingColumns: DataTableColumn<Wealth["incoming"][number]>[] = [
  {
    id: "invoice", header: "الفاتورة", className: "whitespace-normal!",
    cell: (row) => (
      <Link href={`/purchasing/invoices/${row.invoiceId}`} className="font-semibold text-foreground hover:underline">
        <bdi>{row.invoiceNumber}</bdi>
      </Link>
    ),
  },
  { id: "supplier", header: "المورد", className: "hidden sm:table-cell", cell: (row) => row.supplier ?? "—" },
  { id: "units", header: "القطع", cell: (row) => formatQuantity(row.units) },
  { id: "value", header: "التكلفة", align: "end", cell: (row) => usd(row.valueUsd) },
]

const stockColumns: DataTableColumn<Wealth["stock"][number]>[] = [
  {
    id: "name",
    header: "المنتج",
    className: "whitespace-normal!",
    cell: (s) => (
      <div className="flex flex-col">
        <Link href={`/inventory/${s.productId}`} className="font-semibold text-foreground hover:text-blue hover:underline">
          {s.name}
        </Link>
        <span className="text-xs text-muted-foreground">
          {formatQuantity(s.available)} في المستودع{s.inTransit > 0 ? ` · ${formatQuantity(s.inTransit)} مع الزبائن` : ""}
        </span>
      </div>
    ),
  },
  { id: "warehouse", header: "المستودع", className: "hidden sm:table-cell", cell: (s) => usd(s.valueUsd) },
  { id: "transit", header: "مع الزبائن", className: "hidden sm:table-cell", cell: (s) => usd(s.inTransitValueUsd) },
  { id: "value", header: "القيمة", align: "end", cell: (s) => <span className="font-semibold">{usd(s.valueUsd + s.inTransitValueUsd)}</span> },
]

const advanceColumns: DataTableColumn<Wealth["advances"][number]>[] = [
  {
    id: "name",
    header: "الشخص",
    cell: (a) => (
      <Link href={`/finance/advances/${a.personId}`} className="font-semibold text-foreground hover:text-blue hover:underline">
        {a.name}
      </Link>
    ),
  },
  { id: "usd", header: "دولار", cell: (a) => <MoneyAmount value={a.usd} currency="USD" /> },
  { id: "syp", header: "ليرة", className: "hidden sm:table-cell", cell: (a) => <MoneyAmount value={a.syp} currency="SYP" /> },
  { id: "value", header: "القيمة بالدولار", align: "end", cell: (a) => <span className="font-semibold">{usd(a.valueUsd)}</span> },
]

function Section<T>({ title, total, of, columns, rows, getRowId, empty }: {
  title: string
  total: number
  of: number
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  empty: string
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <h2 className="flex flex-wrap items-baseline justify-between gap-2 h3">
        <span>{title}</span>
        <span className="small text-muted-foreground">
          {usd(total)} · {share(total, of)} من الثروة
        </span>
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed bg-card px-4 py-6 text-center small text-muted-foreground">{empty}</p>
      ) : (
        <DataTable caption={title} columns={columns} rows={rows} getRowId={getRowId} />
      )}
    </section>
  )
}

export function WealthView() {
  const wealth = useWealth()

  if (wealth.isPending) return <Skeleton className="h-96 w-full" />
  if (wealth.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert>{toUserMessage(wealth.error)}</Alert>
        <Button variant="outline" onClick={() => wealth.refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  const { totals, accounts, stock, incoming, advances, rate } = wealth.data
  const inventory = totals.inventoryUsd + totals.inTransitUsd
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الثروة"
        description={
          rate.sellRate ? (
            <>
              كل ما يملكه المتجر الآن بالدولار. الليرة محسوبة بسعر المبيع <SypAmount value={rate.sellRate} />، والمخزون بالتكلفة الواصلة.
            </>
          ) : (
            "كل ما يملكه المتجر الآن بالدولار، والمخزون بالتكلفة الواصلة."
          )
        }
      />
      {totals.sypExcluded ? <Alert>لا يوجد سعر صرف، فمبالغ الليرة غير محسوبة في المجموع. أدخل سعر اليوم من صفحة أسعار الصرف.</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="المجموع" value={usd(totals.totalUsd)} tone="accent" />
        <StatTile label="الكاش" value={usd(totals.cashUsd)} hint={share(totals.cashUsd, totals.totalUsd)} />
        <StatTile label="المخزون" value={usd(inventory)} hint={<>منه {usd(totals.inTransitUsd)} مع الزبائن</>} />
        <StatTile label="مشتريات في الطريق" value={usd(totals.incomingUsd)} hint={share(totals.incomingUsd, totals.totalUsd)} />
        <StatTile label="سلف عند الأشخاص" value={usd(totals.advancesUsd)} hint={share(totals.advancesUsd, totals.totalUsd)} />
      </div>

      <Section title="الصناديق" total={totals.cashUsd} of={totals.totalUsd} columns={accountColumns} rows={accounts} getRowId={(a) => a.id} empty="لا صناديق." />
      <Section title="المخزون" total={inventory} of={totals.totalUsd} columns={stockColumns} rows={stock} getRowId={(s) => s.productId} empty="لا بضاعة في المخزون." />
      <Section title="مشتريات في الطريق" total={totals.incomingUsd} of={totals.totalUsd} columns={incomingColumns} rows={incoming} getRowId={(row) => row.invoiceId} empty="لا فواتير بانتظار الاستلام." />
      <Section title="السلف" total={totals.advancesUsd} of={totals.totalUsd} columns={advanceColumns} rows={advances} getRowId={(a) => a.personId} empty="لا سلف مفتوحة." />
    </div>
  )
}

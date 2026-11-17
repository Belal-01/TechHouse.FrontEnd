"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { FormDialog } from "@/components/common/form-dialog"
import { MoneyAmount } from "@/components/common/money-amount"
import { StatTile } from "@/components/common/stat-tile"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import { toUserMessage } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"
import { dashboardKeys } from "@/features/dashboard"
import { cashKeys, useCashAccounts } from "../../api/cash"
import { partnerKeys } from "../../api/partners"
import { amount } from "../../schemas/cash.schema"
import { BalanceHint } from "../balance-hint"
import { useMoneyDialogSubmit } from "../cash/use-money-dialog"
import { AccountField, AmountField, NoteField } from "../form-fields"

type PayoutKind = "CAPITAL_PAYOUT" | "PROFIT_PAYOUT"
type Invoice = {
  id: string
  number: string
  fundedUsd: number
  fundingPercent: number
  profitPercent: number
  invoiceProfitUsd: number
  capitalRecoveredUsd: number
  profitUsd: number
}
type Movement = {
  id: string
  kind: PayoutKind | "REINVEST"
  amountUsd: number
  account?: string
  invoiceId?: string
  note?: string
  createdAt: string
  reversedAt?: string
}
type Statement = { invoices: Invoice[]; movements: Movement[]; capitalAvailableUsd: number; profitAvailableUsd: number }

const labels = { CAPITAL_PAYOUT: "سحب رأس مال", PROFIT_PAYOUT: "صرف أرباح", REINVEST: "إعادة تمويل" }
const path = (id: string) => `/admin/finance/partners/${encodeURIComponent(id)}/settlement`
const key = partnerKeys.settlement
const usd = (value: number) => <MoneyAmount value={value} currency="USD" />
const invoiceColumns: DataTableColumn<Invoice>[] = [
  {
    id: "invoice", header: "الفاتورة",
    cell: (row) => <Link className="hover:underline" href={`/purchasing/invoices/${row.id}`}><bdi>{row.number}</bdi></Link>,
  },
  {
    id: "funded", header: "التمويل", className: "hidden sm:table-cell",
    cell: (row) => <>{usd(row.fundedUsd)} <bdi>({row.fundingPercent}%)</bdi></>,
  },
  { id: "net", header: "صافي ربح الفاتورة", className: "hidden md:table-cell", cell: (row) => usd(row.invoiceProfitUsd) },
  { id: "capital", header: "رأس مال مسترد", cell: (row) => usd(row.capitalRecoveredUsd) },
  {
    id: "profit", header: "حصة ربح أو خسارة", cell: (row) => (
      <div className="flex flex-col">
        {usd(row.profitUsd)}
        <span className="small text-muted-foreground">{row.profitPercent}٪ من ربح الجزء المموّل</span>
      </div>
    ),
  },
]
const movementColumns: DataTableColumn<Movement>[] = [
  {
    id: "kind", header: "الحركة",
    cell: (row) => (
      <div className="flex flex-col">
        <span>{labels[row.kind]}{row.reversedAt ? " · معكوسة" : ""}</span>
        <span className="small text-muted-foreground">{formatDateTime(row.createdAt)}</span>
        {row.account ? <span className="small">{row.account}</span> : null}
        {row.invoiceId ? <Link className="small hover:underline" href={`/purchasing/invoices/${row.invoiceId}`}>فاتورة التمويل</Link> : null}
        {row.note ? <span className="small whitespace-normal">{row.note}</span> : null}
      </div>
    ),
  },
  { id: "amount", header: "المبلغ", cell: (row) => usd(row.amountUsd) },
]

export function InvestorStatement({ investorId }: { investorId: string }) {
  const query = useQuery({
    queryKey: key(investorId), queryFn: () => api.get<Statement>(path(investorId)),
    staleTime: 0, refetchOnMount: "always",
  })
  const [kind, setKind] = useState<PayoutKind | null>(null)

  if (query.isPending) return <Skeleton className="h-32 w-full" />
  if (query.isError) return <Alert>{toUserMessage(query.error)} <Button variant="outline" onClick={() => query.refetch()}>إعادة المحاولة</Button></Alert>
  const data = query.data
  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label="تسوية المستثمر">
      <h2 className="h3">تسوية المستثمر</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="رأس المال المتاح" value={usd(data.capitalAvailableUsd)}
          action={<Button variant="outline" disabled={data.capitalAvailableUsd <= 0} onClick={() => setKind("CAPITAL_PAYOUT")}>سحب</Button>} />
        <StatTile label="رصيد الأرباح والخسائر" value={usd(data.profitAvailableUsd)}
          action={<Button variant="outline" disabled={data.profitAvailableUsd <= 0} onClick={() => setKind("PROFIT_PAYOUT")}>صرف</Button>} />
      </div>
      <DataTable caption="تسوية الفواتير" columns={invoiceColumns} rows={data.invoices} getRowId={(row) => row.id} empty="لا فواتير ممولة." />
      <h3 className="h3">حركات حساب المستثمر</h3>
      <DataTable caption="حركات حساب المستثمر" columns={movementColumns} rows={data.movements} getRowId={(row) => row.id} empty="لا حركات مسجلة." />
      {kind ? <PayoutDialog investorId={investorId} kind={kind} onClose={() => setKind(null)} /> : null}
    </section>
  )
}

const payoutSchema = z.object({
  accountId: z.string().min(1, "اختر الصندوق."),
  amount,
  note: z.string().max(500, "500 حرف كحد أقصى."),
})

function PayoutDialog({ investorId, kind, onClose }: { investorId: string; kind: PayoutKind; onClose: () => void }) {
  const client = useQueryClient()
  const accounts = useCashAccounts()
  const defaultBox = accounts.data?.find((box) => box.isDefault)?.id ?? ""
  const form = useForm<z.infer<typeof payoutSchema>>({
    resolver: zodResolver(payoutSchema),
    defaultValues: { accountId: defaultBox, amount: "", note: "" },
  })
  const { control, register, formState: { errors } } = form
  const [accountId, outgoing] = useWatch({ control, name: ["accountId", "amount"] })
  const { formError, run } = useMoneyDialogSubmit(form.setError, onClose)
  const payout = useMutation({
    mutationFn: (values: z.infer<typeof payoutSchema>) => api.post<Statement>(`${path(investorId)}/payout`, {
      ...values, kind, amount: Number(values.amount), note: values.note.trim() || null,
    }),
    onSuccess: (data) => {
      client.setQueryData(key(investorId), data)
      return Promise.all([
        client.invalidateQueries({ queryKey: cashKeys.all }),
        client.invalidateQueries({ queryKey: dashboardKeys.all }),
      ])
    },
  })

  return (
    <FormDialog open onOpenChange={(open) => { if (!open) onClose() }} title={labels[kind]}
      description="يُخصم المبلغ بالدولار من الصندوق ومن رصيد المستثمر."
      submitLabel="تأكيد الدفع" cancelLabel="رجوع" isPending={payout.isPending} error={formError}
      onSubmit={form.handleSubmit((values) => run(() => payout.mutateAsync(values), "سُجّل الدفع"))}>
      <AccountField control={control} name="accountId" id="investor-payout-account" label="الصندوق" error={errors.accountId} />
      <AmountField register={register} name="amount" id="investor-payout-amount" label="المبلغ بالدولار" currency="USD" error={errors.amount} />
      <BalanceHint accountId={accountId} currency="USD" outgoing={Number(outgoing)} />
      <NoteField register={register} name="note" id="investor-payout-note" label="ملاحظة" error={errors.note} />
    </FormDialog>
  )
}
